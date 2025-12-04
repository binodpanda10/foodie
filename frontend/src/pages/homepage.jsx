import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Leaf, MapPin, Sparkles, TrendingUp, Users, Navigation, ShoppingCart, LogOut, UserPlus, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Homepage = () => {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);
  const [showVeganOnly, setShowVeganOnly] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [complementaryFoods, setComplementaryFoods] = useState([]);
  const [collaborativeSuggestions, setCollaborativeSuggestions] = useState([]);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('restaurants');
  const [customerId, setCustomerId] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 27.7172, lng: 85.3240 });
  const [locationRadius, setLocationRadius] = useState(10);
  const [cart, setCart] = useState({});
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';
  const SERVER_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    // Check for customer info in localStorage
    const customerData = localStorage.getItem('customerData');
    if (customerData) {
      const { customer_id } = JSON.parse(customerData);
      setCustomerId(customer_id);
    }

    getUserLocation();
  }, []);

  useEffect(() => {
    if (!customerId) return; // Don't fetch data if not logged in

    fetchNearbyRestaurants();
    fetchPersonalizedSuggestions();
  }, [customerId, userLocation, locationRadius]); // Re-fetch if location or customer changes

  useEffect(() => {
    if (selectedRestaurant === 'all') {
      fetchAllFoodsFromAllRestaurants();
    } else {
      fetchFoodsByRestaurant(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    filterFoods();
  }, [searchTerm, selectedBudget, showVegetarianOnly, showVeganOnly, foods]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Using default location (Kathmandu)');
        }
      );
    }
  };

  const fetchNearbyRestaurants = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurants/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${locationRadius}`
      );
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      setRestaurants([
        {
          restaurant_id: 1,
          name: 'Italian Bistro',
          description: 'Authentic Italian cuisine',
          latitude: 27.7172,
          longitude: 85.3240,
          distance_km: 1.5
        },
        {
          restaurant_id: 2,
          name: 'Spice Garden',
          description: 'Traditional Asian flavors',
          latitude: 27.7000,
          longitude: 85.3200,
          distance_km: 2.8
        }
      ]);
    }
  };

  const fetchAllFoodsFromAllRestaurants = async () => {
    try {
      // Use the new, efficient endpoint
      const response = await fetch(`${API_BASE_URL}/foods`);
      const data = await response.json();
      if (data.success) {
        // The backend now provides all necessary data, including photo_url
        setFoods(data.foods || []);
      } else {
        console.error('Failed to fetch all foods:', data.message);
        setMockFoods();
      }
    } catch (error) {
      console.error('Error fetching all foods:', error);
      setMockFoods();
    }
  };

  const fetchFoodsByRestaurant = async (restaurantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/foods`);
      const data = await response.json();
      if (data.success) {
        const restaurant = restaurants.find(r => r.restaurant_id === parseInt(restaurantId));
        const foodsWithRestaurant = data.foods.map(food => ({
          ...food,
          restaurant_name: restaurant?.name,
          distance_km: restaurant?.distance_km
        }));
        setFoods(foodsWithRestaurant);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setMockFoods();
    }
  };

  const setMockFoods = () => {
    setFoods([
      {
        food_id: 1,
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil',
        price: 12.99,
        budget_category: 'Affordable',
        is_vegetarian: 1,
        is_vegan: 0,
        restaurant_name: 'Italian Bistro',
        distance_km: 1.5
      },
      {
        food_id: 2,
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan and croutons',
        price: 8.99,
        budget_category: 'Affordable',
        is_vegetarian: 1,
        is_vegan: 0,
        restaurant_name: 'Italian Bistro',
        distance_km: 1.5
      },
      {
        food_id: 3,
        name: 'Truffle Pasta',
        description: 'Handmade pasta with black truffle and cream sauce',
        price: 28.99,
        budget_category: 'Premium',
        is_vegetarian: 1,
        is_vegan: 0,
        restaurant_name: 'Italian Bistro',
        distance_km: 1.5
      },
      {
        food_id: 4,
        name: 'Pad Thai',
        description: 'Traditional Thai stir-fried noodles',
        price: 14.99,
        budget_category: 'Mid-Range',
        is_vegetarian: 0,
        is_vegan: 0,
        restaurant_name: 'Spice Garden',
        distance_km: 2.8
      }
    ]);
  };

  const fetchComplementaryFoods = async (foodId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/foods/${foodId}/complementary`);
      const data = await response.json();
      if (data.success) {
        setComplementaryFoods(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching complementary foods:', error);
      setComplementaryFoods([]);
    }
  };

  const fetchCollaborativeSuggestions = async (foodId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/foods/${foodId}/collaborative`);
      const data = await response.json();
      if (data.success) {
        setCollaborativeSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching collaborative suggestions:', error);
      setCollaborativeSuggestions([]);
    }
  };

  const fetchPersonalizedSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/foods/personalized/${customerId}`);
      const data = await response.json();
      if (data.success) {
        setPersonalizedSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching personalized suggestions:', error);
      setPersonalizedSuggestions([]);
    }
  };

  const filterFoods = () => {
    let filtered = foods;

    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBudget !== 'All') {
      filtered = filtered.filter(food => food.budget_category === selectedBudget);
    }

    if (showVegetarianOnly) {
      filtered = filtered.filter(food => food.is_vegetarian === 1 || food.is_vegetarian === true);
    }

    if (showVeganOnly) {
      filtered = filtered.filter(food => food.is_vegan === 1 || food.is_vegan === true);
    }

    setFilteredFoods(filtered);
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    fetchComplementaryFoods(food.food_id);
    fetchCollaborativeSuggestions(food.food_id);
    setActiveTab('complementary');
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant.restaurant_id.toString());
    setActiveTab('foods');
  };

  const updateQuantity = (foodId, change) => {
    setCart(prev => {
      const currentQty = prev[foodId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [foodId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [foodId]: newQty };
    });
  };

  const handleOrderNow = (food) => {
    const quantity = cart[food.food_id] || 0;
    if (quantity === 0) {
      alert('Please add at least 1 item to order');
      return;
    }
    
    alert(`Order placed!\n${food.name} x${quantity}\nTotal: ${(food.price * quantity).toFixed(2)}\n\nFrom: ${food.restaurant_name}`);
    
    // Clear this item from cart after order
    setCart(prev => {
      const { [food.food_id]: removed, ...rest } = prev;
      return rest;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [foodId, qty]) => {
      const food = foods.find(f => f.food_id === parseInt(foodId));
      return total + (food ? food.price * qty : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('customerData');
    setCustomerId(null);
    navigate('/login');
  };

//   const RestaurantCard = ({ restaurant }) => {
//     // Log the restaurant's photo URL to the console for debugging
//     console.log(`Restaurant: ${restaurant.name}, Image URL: ${SERVER_BASE_URL}${restaurant.photo_url}`);
//     return (
//       <div 
//       onClick={() => handleRestaurantClick(restaurant)}
//       className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
//     >
//       {/* Use a container with a fixed aspect ratio to prevent layout shifts and ensure visibility */}
//       {restaurant.photo_url && (
//         <div className="w-full aspect-video bg-gray-200">
//           <img 
//             src={`${SERVER_BASE_URL}${restaurant.photo_url}`} 
//             alt={restaurant.name} 
//             className="w-full h-full object-cover"
//             onError={(e) => { e.target.style.display = 'none'; }} // Hide broken images
//           />
//         </div>
//       )}
//       <div className="p-6">
//         <div className="flex justify-between items-start mb-3">
//           <h3 className="text-xl font-semibold text-gray-800">{restaurant.name}</h3>
//           <div className="flex items-center gap-1 text-sm text-orange-600 font-semibold">
//             <MapPin size={16} />
//             {restaurant.distance_km.toFixed(1)} km
//           </div>
//         </div>

//         <p className="text-gray-600 text-sm mb-4">{restaurant.description}</p>

//         <div className="flex items-center justify-between">
//           <div className="text-sm text-gray-500">
//             <MapPin size={14} className="inline mr-1" />
//             Lat: {Number(restaurant.latitude).toFixed(4)}, Lng: {Number(restaurant.longitude).toFixed(4)}
//           </div>
//           <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
//             View Menu
//           </button>
//         </div>
//       </div>
//     </div>
//     );
//   };

// const FoodCard = ({ food, onClick, showSuggestionScore = false }) => {
//   const quantity = cart[food.food_id] || 0;
  
//   // Log the food item's photo URL to the console for debugging, handling null values gracefully.
//   console.log(`Food: ${food.name}, Image URL: ${food.photo_url ? SERVER_BASE_URL + food.photo_url : 'None'}`);

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
//       {/* Only render image container if photo_url exists */}
//       {food.photo_url && (
//         <div className="w-full aspect-video bg-gray-200">
//           <img 
//             src={`${SERVER_BASE_URL}${food.photo_url}`} 
//             alt={food.name} 
//             className="w-full h-full object-cover"
//             onError={(e) => {
//               // Hide image on error and show placeholder
//               e.target.style.display = 'none';
//               e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
//             }}
//           />
//         </div>
//       )}
      
//       <div className="p-6">
//         <div 
//           onClick={() => onClick && onClick(food)}
//           className={onClick ? 'cursor-pointer' : ''}
//         >
//           <div className="flex justify-between items-start mb-3">
//             <h3 className="text-xl font-semibold text-gray-800">{food.name}</h3>
//             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//               food.budget_category === 'Affordable' ? 'bg-green-100 text-green-800' :
//               food.budget_category === 'Mid-Range' ? 'bg-blue-100 text-blue-800' :
//               'bg-purple-100 text-purple-800'
//             }`}>
//               {food.budget_category}
//             </span>
//           </div>

//           <p className="text-gray-600 text-sm mb-3 line-clamp-2">{food.description}</p>

//           {food.restaurant_name && (
//             <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
//               <MapPin size={14} className="text-orange-500" />
//               <span className="font-medium">{food.restaurant_name}</span>
//               {food.distance_km && (
//                 <span className="text-orange-600 font-semibold">• {food.distance_km.toFixed(1)} km</span>
//               )}
//             </div>
//           )}

//           <div className="flex items-center gap-2 mb-4">
//             {(food.is_vegetarian === 1 || food.is_vegetarian === true) && (
//               <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
//                 <Leaf size={12} />
//                 Veg
//               </span>
//             )}
//             {(food.is_vegan === 1 || food.is_vegan === true) && (
//               <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
//                 <Leaf size={12} />
//                 Vegan
//               </span>
//             )}
//           </div>

//           <div className="flex justify-between items-center mb-4">
//             <span className="text-2xl font-bold text-orange-600">${food.price}</span>
//             {showSuggestionScore && food.suggestion_score && (
//               <div className="flex items-center gap-1 text-sm text-gray-600">
//                 <Star size={16} className="text-yellow-500 fill-yellow-500" />
//                 <span>{food.suggestion_score} matches</span>
//               </div>
//             )}
//             {food.average_rating && (
//               <div className="flex items-center gap-1 text-sm text-gray-600">
//                 <Star size={16} className="text-yellow-500 fill-yellow-500" />
//                 <span>{Number(food.average_rating).toFixed(1)}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quantity Controls */}
//         <div className="flex items-center gap-3 mb-3">
//           <button
//             onClick={() => updateQuantity(food.food_id, -1)}
//             disabled={quantity === 0}
//             className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-colors"
//           >
//             −
//           </button>
//           <span className="text-xl font-semibold min-w-[40px] text-center">{quantity}</span>
//           <button
//             onClick={() => updateQuantity(food.food_id, 1)}
//             className="w-10 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors"
//           >
//             +
//           </button>
//         </div>

//         {/* Order Now Button */}
//         <button
//           onClick={() => handleOrderNow(food)}
//           disabled={quantity === 0}
//           className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 text-white"
//         >
//           {quantity === 0 ? 'Add to Cart First' : `Order Now - $${(food.price * quantity).toFixed(2)}`}
//         </button>
//       </div>
//     </div>
//   );
// };

const RestaurantCard = ({ restaurant }) => {
  // Only create URL if photo_url exists AND is not null
  const imageUrl = (restaurant.photo_url && restaurant.photo_url !== 'null') 
    ? `${SERVER_BASE_URL}${restaurant.photo_url}` 
    : null;

  return (
    <div 
      onClick={() => handleRestaurantClick(restaurant)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
    >
      {imageUrl ? (
        <div className="w-full h-48 bg-gray-200">
          <img 
            src={imageUrl}
            alt={restaurant.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-400">Image unavailable</span></div>';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800">{restaurant.name}</h3>
          <div className="flex items-center gap-1 text-sm text-orange-600 font-semibold">
            <MapPin size={16} />
            {restaurant.distance_km.toFixed(1)} km
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{restaurant.description}</p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <MapPin size={14} className="inline mr-1" />
            Lat: {Number(restaurant.latitude).toFixed(4)}, Lng: {Number(restaurant.longitude).toFixed(4)}
          </div>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
            View Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const FoodCard = ({ food, onClick, showSuggestionScore = false }) => {
  const quantity = cart[food.food_id] || 0;
  
  // Only create URL if photo_url exists AND is not null
  const imageUrl = (food.photo_url && food.photo_url !== 'null') 
    ? `${SERVER_BASE_URL}${food.photo_url}` 
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all">
      {imageUrl ? (
        <div className="w-full aspect-video bg-gray-200">
          <img 
            src={imageUrl}
            alt={food.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-400">Image unavailable</span></div>';
            }}
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      
      <div className="p-6">
        {/* Rest of the FoodCard code stays the same */}
        <div 
          onClick={() => onClick && onClick(food)}
          className={onClick ? 'cursor-pointer' : ''}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-800">{food.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              food.budget_category === 'Affordable' ? 'bg-green-100 text-green-800' :
              food.budget_category === 'Mid-Range' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {food.budget_category}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{food.description}</p>

          {food.restaurant_name && (
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <MapPin size={14} className="text-orange-500" />
              <span className="font-medium">{food.restaurant_name}</span>
              {food.distance_km && (
                <span className="text-orange-600 font-semibold">• {food.distance_km.toFixed(1)} km</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            {(food.is_vegetarian === 1 || food.is_vegetarian === true) && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                <Leaf size={12} />
                Veg
              </span>
            )}
            {(food.is_vegan === 1 || food.is_vegan === true) && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                <Leaf size={12} />
                Vegan
              </span>
            )}
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-orange-600">${food.price}</span>
            {showSuggestionScore && food.suggestion_score && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span>{food.suggestion_score} matches</span>
              </div>
            )}
            {food.average_rating && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span>{Number(food.average_rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => updateQuantity(food.food_id, -1)}
            disabled={quantity === 0}
            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-colors"
          >
            −
          </button>
          <span className="text-xl font-semibold min-w-[40px] text-center">{quantity}</span>
          <button
            onClick={() => updateQuantity(food.food_id, 1)}
            className="w-10 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={() => handleOrderNow(food)}
          disabled={quantity === 0}
          className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 text-white"
        >
          {quantity === 0 ? 'Add to Cart First' : `Order Now - $${(food.price * quantity).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};



  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Foodie!</h1>
          <p className="text-gray-600 mb-8">Please sign in or create an account to discover amazing food.</p>
          <div className="space-y-4">
            <Link to="/login">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                <LogIn size={20} />
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                <UserPlus size={20} />
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header - Same as Owner Dashboard */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Foodie Customer</h1>
              <p className="text-gray-600 mt-1">Discover your next favorite meal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Navigation size={18} className="text-orange-500" />
                <span>Within {locationRadius} km</span>
              </div>
              {getTotalItems() > 0 && (
                <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg">
                  <ShoppingCart size={20} />
                  <span className="font-semibold">{getTotalItems()} items • ${getCartTotal().toFixed(2)}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <LogOut size={18} /> 
               Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Section - Above banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search for restaurants or food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-lg text-lg focus:ring-4 focus:ring-orange-300 focus:outline-none shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-3">Personalized Food Recommendations</h2>
          <p className="text-xl text-orange-100">
            Powered by smart algorithms • Budget-friendly options • Complementary pairings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'restaurants'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin size={18} className="inline mr-2" />
              Nearby Restaurants
            </button>
            <button
              onClick={() => {
                setActiveTab('foods');
                setSelectedRestaurant('all');
              }}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'foods'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter size={18} className="inline mr-2" />
              All Foods
            </button>
            <button
              onClick={() => setActiveTab('personalized')}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'personalized'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Sparkles size={18} className="inline mr-2" />
              For You
            </button>
            {selectedFood && (
              <>
                <button
                  onClick={() => setActiveTab('complementary')}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'complementary'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp size={18} className="inline mr-2" />
                  Goes Well With
                </button>
                <button
                  onClick={() => setActiveTab('collaborative')}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'collaborative'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users size={18} className="inline mr-2" />
                  Others Also Liked
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters - Only show for food tabs */}
        {(activeTab === 'foods' || activeTab === 'complementary' || activeTab === 'collaborative') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="All">All Budgets</option>
                  <option value="Affordable">💰 Affordable</option>
                  <option value="Mid-Range">💰💰 Mid-Range</option>
                  <option value="Premium">💰💰💰 Premium</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowVegetarianOnly(!showVegetarianOnly)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    showVegetarianOnly
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Leaf size={16} className="inline mr-1" />
                  Veg
                </button>
                <button
                  onClick={() => setShowVeganOnly(!showVeganOnly)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    showVeganOnly
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vegan
                </button>
              </div>

              {activeTab === 'foods' && restaurants.length > 0 && (
                <div>
                  <select
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Restaurants</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.restaurant_id} value={restaurant.restaurant_id}>
                        {restaurant.name} - {restaurant.distance_km.toFixed(1)} km
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Food Info */}
        {selectedFood && (activeTab === 'complementary' || activeTab === 'collaborative') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Recommendations based on: {selectedFood.name}
                </h3>
                <p className="text-gray-600">{selectedFood.description}</p>
                {selectedFood.restaurant_name && (
                  <p className="text-sm text-gray-500 mt-2">
                    <MapPin size={14} className="inline" /> {selectedFood.restaurant_name} • {selectedFood.distance_km.toFixed(1)} km away
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setActiveTab('foods');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div>
          {activeTab === 'restaurants' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Restaurants Near You ({restaurants.length})
              </h2>
              <p className="text-gray-600 mb-6">Sorted by distance from your location</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(restaurant => (
                  <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
                ))}
              </div>
              {restaurants.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No restaurants found in your area</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'foods' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {selectedRestaurant === 'all' ? 'All Foods' : restaurants.find(r => r.restaurant_id === parseInt(selectedRestaurant))?.name || 'Foods'} ({filteredFoods.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoods.map(food => (
                  <FoodCard key={food.food_id} food={food} onClick={handleFoodClick} />
                ))}
              </div>
              {filteredFoods.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 text-lg">No food items found matching your filters</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'personalized' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Personalized Just For You</h2>
              <p className="text-gray-600 mb-6">Based on your taste preferences and ratings</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedSuggestions.map(food => (
                  <FoodCard key={food.food_id} food={food} onClick={handleFoodClick} showSuggestionScore />
                ))}
              </div>
              {personalizedSuggestions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Start rating foods to get personalized recommendations!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'complementary' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfect Pairings</h2>
              <p className="text-gray-600 mb-6">Foods that go great with {selectedFood?.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complementaryFoods.map(food => (
                  <FoodCard key={food.food_id} food={food} onClick={handleFoodClick} />
                ))}
              </div>
              {complementaryFoods.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 text-lg">No complementary foods available yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collaborative' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Popular Combinations</h2>
              <p className="text-gray-600 mb-6">What others enjoyed with {selectedFood?.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborativeSuggestions.map(food => (
                  <FoodCard key={food.food_id} food={food} onClick={handleFoodClick} showSuggestionScore />
                ))}
              </div>
              {collaborativeSuggestions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 text-lg">No collaborative suggestions available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;