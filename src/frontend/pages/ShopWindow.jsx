import React, { useState, useEffect } from 'react';
import { getShopItems, ProcessBuying } from '../../backend/controllers/shopController';
import './../css/shop.css'; 
import { useAuth } from '../../authContext';
const ShopWindow = () => {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const items = await getShopItems();
        setShopItems(items);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchShopItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleBuyClick = (item) => {
      const confirmed = window.confirm(`Are you sure you want to buy ${item.name} for ${item.price}?`);
      if (confirmed) {
          console.log("Buy clicked for item:", item);
          ProcessBuying(item, currentUser)
              .then(success => {
                  if (success) {
                      window.alert("Purchase successful!");
                  } else {
                      window.alert("Purchase failed.");
                  }
              })
              .catch(error => {
                  window.alert("An error occurred during the purchase.");
                  console.error("Error during the purchase process:", error);
              });
      }
  };

  return (
    <div className='shopContainer'>
      <h2>Shop Items</h2>
      {shopItems.length === 0 ? (
        <p>No items found</p>
      ) : (
        <div className="grid-container">
          {shopItems.map(item => (
            <div key={item.id} className="grid-item">
              <h3>{item.name}</h3>
              <img src={item.URL} alt={item.name} />
              <p>Price: {item.price}</p>
              <button onClick={() => handleBuyClick(item)}>Buy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopWindow;
