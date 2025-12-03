import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [restaurantId, setRestaurantId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const navigate = useNavigate();
  const [currentFood, setCurrentFood] = useState({
    food_id: null, // This will be set dynamically
    restaurant_id: null,
    name: '',
    description: '',
    price: '',
    budget_category: 'Affordable',
    is_vegetarian: false,
    is_vegan: false
  });

  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // On component mount, check for owner info in localStorage
    const ownerData = localStorage.getItem('ownerData');
    if (ownerData) {
      const { owner_id, restaurant_id } = JSON.parse(ownerData);
      setOwnerId(owner_id);

      if (restaurant_id) {
        setRestaurantId(restaurant_id);
        fetchFoods(restaurant_id);
      }
      // If restaurant_id is null, the component will render the "Create Restaurant" form

    } else {
      // If no owner data, redirect to login
      alert('You must be logged in to view this page.');
      navigate('/owner-login'); // Adjust this to your owner login route
    }
  }, []);

  useEffect(() => {
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

    setFilteredFoods(filtered);
  }, [searchTerm, selectedBudget, foods]);

  const fetchFoods = async (resId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${resId}/foods`); // Updated endpoint
      const data = await response.json();
      if (data.success) {
        setFoods(data.foods || []); 
      } else {
        console.error('Failed to fetch foods:', data.message);
        setFoods([]); // Clear food list on failure
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      alert(`Network Error: Could not fetch food data. Is the backend server running?`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFood(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRestaurantInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestaurant.name || !newRestaurant.latitude || !newRestaurant.longitude) {
      alert('Please fill in all required restaurant fields.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRestaurant, owner_id: ownerId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Restaurant created successfully!');
        const newRestaurantId = data.restaurant_id;

        // Update localStorage with the new restaurant_id
        const ownerData = JSON.parse(localStorage.getItem('ownerData'));
        ownerData.restaurant_id = newRestaurantId;
        localStorage.setItem('ownerData', JSON.stringify(ownerData));

        // Update state to re-render the dashboard
        setRestaurantId(newRestaurantId);
        fetchFoods(newRestaurantId);
      } else {
        alert(`Error creating restaurant: ${data.message}`);
      }
    } catch (error) {
      alert('An error occurred while creating the restaurant.');
    }
  };

  const handleSubmit = async () => {
    if (!restaurantId) {
      alert('Could not find a restaurant associated with your account.');
      return;
    }

    try {
      const url = editMode
        ? `${API_BASE_URL}/foods/${currentFood.food_id}`
        : `${API_BASE_URL}/foods`;

      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...currentFood, restaurant_id: restaurantId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchFoods(restaurantId);
        closeModal();
        alert(editMode ? 'Food updated successfully!' : 'Food created successfully!');
      } else {
        // If the server returns an error, display its message
        alert(`Error: ${data.message || 'An unknown error occurred.'}`);
      }
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Error saving food item');
    }
  };

  const handleEdit = (food) => {
    setCurrentFood(food);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/foods/${foodId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchFoods(restaurantId);
        alert('Food deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Error deleting food item');
    }
  };

  const openCreateModal = () => {
    setCurrentFood({
      food_id: null,
      restaurant_id: restaurantId,
      name: '',
      description: '',
      price: '',
      budget_category: 'Affordable',
      is_vegetarian: false,
      is_vegan: false
    });
    setEditMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('ownerData');
    navigate('/owner-login'); // Adjust to your owner login route
  };

  // Render this UI if the owner has no restaurant yet
  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, Owner!</h1>
            <p className="text-gray-600 mt-2">Let's set up your restaurant to get you started.</p>
          </div>
          <form onSubmit={handleCreateRestaurant} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
              <input
                type="text" name="name" required
                value={newRestaurant.name} onChange={handleRestaurantInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description" rows="3"
                value={newRestaurant.description} onChange={handleRestaurantInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                <input
                  type="number" name="latitude" step="any" required
                  placeholder="e.g., 34.0522"
                  value={newRestaurant.latitude} onChange={handleRestaurantInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                <input
                  type="number" name="longitude" step="any" required
                  placeholder="e.g., -118.2437"
                  value={newRestaurant.longitude} onChange={handleRestaurantInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors">
                Create Restaurant
              </button>
              <button type="button" onClick={handleLogout} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors">
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Foodie Owner Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant menu</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add New Food
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="All">All Budget Categories</option>
                <option value="Affordable">Affordable</option>
                <option value="Mid-Range">Mid-Range</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <div key={food.food_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
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

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{food.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  {food.is_vegetarian && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Vegetarian</span>
                  )}
                  {food.is_vegan && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Vegan</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">${food.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(food)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(food.food_id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No food items found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editMode ? 'Edit Food Item' : 'Add New Food Item'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentFood.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={currentFood.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={currentFood.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Category *
                    </label>
                    <select
                      name="budget_category"
                      value={currentFood.budget_category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Affordable">Affordable</option>
                      <option value="Mid-Range">Mid-Range</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_vegetarian"
                      checked={currentFood.is_vegetarian}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_vegan"
                      checked={currentFood.is_vegan}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Vegan</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {editMode ? 'Update Food' : 'Create Food'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;