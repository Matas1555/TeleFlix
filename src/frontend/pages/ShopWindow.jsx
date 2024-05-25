import React, { useState, useEffect } from 'react';
import { getShopItems } from '../../backend/controllers/shopController';
import './../css/shop.css'; 

const ShopWindow = () => {
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    console.log("Buy clicked for item:", item);
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
