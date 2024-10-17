// Function to check if a combination of selected features is valid
export const isValidFeatureCombination = (selectedOptions) => {
    
    const selectedOptionNames = selectedOptions.map(option => option.option_name);
  
   

    if (selectedOptionNames.includes("Green") && selectedOptionNames.includes("Leather Interior")) {
      return false;
    }
  
    // Add more rules as necessary for your specific car customizations
    return true;
  };
  
  
  