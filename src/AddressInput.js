import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { useEffect, useState } from 'react';
const AddressInput = ({ formData, handleChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const fetchSuggestions = async (query) => {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=pk.8352cabad1d3712a26fc91446c7c7996=${query}&limit=5&countrycodes=us`
    );
    const data = await response.json();
    setSuggestions(data);
  };
  const handleInputChange = (e) => {
    handleChange(e);
    fetchSuggestions(e.target.value);
  };
  return (
    <div>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        className="form-control"
        placeholder="City, neighbourhood or ZIP code ..."
      />
      {suggestions.length > 0 && (
        <ul className="list-group">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              className="list-group-item"
              onClick={() => handleChange({ target: { name: 'address', value: item.display_name } })}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;