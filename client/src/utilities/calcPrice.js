// Function to calculate total price of a car based on selected options
export const calculateTotalPrice = (selectedOptions) => {
    // selectedOptions is expected to be an array of option objects with price_modifier field
    const totalPrice = selectedOptions.reduce((acc, option) => acc + option.price_modifier, 0);
    return totalPrice;
  };
  
  // Example usage in frontend:
  // const totalPrice = calculateTotalPrice(selectedOptions);
  