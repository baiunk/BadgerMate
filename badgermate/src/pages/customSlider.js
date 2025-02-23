import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './customSlider.css'; // Import your custom CSS

const CustomSlider = () => {
  const [value, setValue] = useState(0);

  // Create marks every 100 dollars
  const marks = {};
  for (let i = 0; i <= 5000; i += 100) {
    marks[i] = `$${i}`;
  }

  return (
    <div style={{ margin: '50px' }}>
      <Slider
        min={0}
        max={5000}
        step={100}
        marks={marks}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export default CustomSlider;
