// Define the furniture material requirements
interface MaterialRequirements {
  wood: number; // cubic meters
  nails: number; // kg
  polish: number; // liters
}

// Define the furniture types and their material requirements per unit
const furnitureRequirements: Record<string, MaterialRequirements> = {
  table: {
    wood: 0.4, // 520 cubic meters / 1300 units
    nails: 0.1, // 130 kg / 1300 units
    polish: 0.1, // 130 liters / 1300 units
  },
  chair: {
    wood: 0.15,
    nails: 0.05,
    polish: 0.03,
  },
  desk: {
    wood: 0.35,
    nails: 0.08,
    polish: 0.08,
  },
};

// Define the material supplier locations
interface Supplier {
  name: string;
  pricePerUnit: {
    wood: number; // price per cubic meter
    nails: number; // price per kg
    polish: number; // price per liter
  };
  distance: Record<string, number>; // distance in km from different factory locations
}

// Define the suppliers with their prices and distances from various factory locations
const suppliers: Supplier[] = [
  {
    name: "Sultan Battery",
    pricePerUnit: {
      wood: 12000, // Rs per cubic meter
      nails: 80, // Rs per kg
      polish: 200, // Rs per liter
    },
    distance: {
      baikampady: 15,
      kuloor: 12,
      surathkal: 20,
      panambur: 18,
      kavoor: 10,
    },
  },
  {
    name: "Ullal Beach",
    pricePerUnit: {
      wood: 12200, // Rs per cubic meter
      nails: 85, // Rs per kg
      polish: 210, // Rs per liter
    },
    distance: {
      baikampady: 25,
      kuloor: 20,
      surathkal: 30,
      panambur: 28,
      kavoor: 18,
    },
  },
  {
    name: "Tannirbhavi Beach",
    pricePerUnit: {
      wood: 12500, // Rs per cubic meter
      nails: 90, // Rs per kg
      polish: 220, // Rs per liter
    },
    distance: {
      baikampady: 22,
      kuloor: 17,
      surathkal: 27,
      panambur: 25,
      kavoor: 15,
    },
  },
  {
    name: "Panambur Port",
    pricePerUnit: {
      wood: 12300, // Rs per cubic meter
      nails: 85, // Rs per kg
      polish: 215, // Rs per liter
    },
    distance: {
      baikampady: 8,
      kuloor: 12,
      surathkal: 12,
      panambur: 3,
      kavoor: 15,
    },
  },
  {
    name: "Kadri Market",
    pricePerUnit: {
      wood: 12900, // Rs per cubic meter
      nails: 95, // Rs per kg
      polish: 230, // Rs per liter
    },
    distance: {
      baikampady: 18,
      kuloor: 10,
      surathkal: 25,
      panambur: 20,
      kavoor: 7,
    },
  },
  {
    name: "Falnir Marketplace",
    pricePerUnit: {
      wood: 12800, // Rs per cubic meter
      nails: 92, // Rs per kg
      polish: 225, // Rs per liter
    },
    distance: {
      baikampady: 20,
      kuloor: 15,
      surathkal: 28,
      panambur: 22,
      kavoor: 12,
    },
  },
];

// Calculate transportation cost - Rs 200 per km
function calculateTransportationCost(distance: number): number {
  return distance * 200;
}

// Calculate total cost for a supplier
function calculateTotalCost(
  supplier: Supplier,
  requirements: MaterialRequirements,
  quantity: number,
  factoryLocation: string
): number {
  // Calculate material costs
  const woodCost = supplier.pricePerUnit.wood * requirements.wood * quantity;
  const nailsCost = supplier.pricePerUnit.nails * requirements.nails * quantity;
  const polishCost = supplier.pricePerUnit.polish * requirements.polish * quantity;

  // Calculate transportation cost
  const distance = supplier.distance[factoryLocation];
  const transportCost = calculateTransportationCost(distance);

  // Calculate total cost
  return woodCost + nailsCost + polishCost + transportCost;
}

// Format number to Indian Rupees
function formatToRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Initialize the application
function init() {
  const calculateBtn = document.getElementById('calculate-btn') as HTMLButtonElement;
  const furnitureTypeSelect = document.getElementById('furniture-type') as HTMLSelectElement;
  const quantityInput = document.getElementById('quantity') as HTMLInputElement;
  const factoryLocationSelect = document.getElementById('factory-location') as HTMLSelectElement;
  const resultsDiv = document.getElementById('results') as HTMLDivElement;
  const locationsListDiv = document.getElementById('locations-list') as HTMLDivElement;

  calculateBtn.addEventListener('click', () => {
    // Get selected values
    const furnitureType = furnitureTypeSelect.value;
    const quantity = parseInt(quantityInput.value, 10);
    const factoryLocation = factoryLocationSelect.value;

    // Get material requirements for the selected furniture type
    const requirements = furnitureRequirements[furnitureType];

    // Calculate total cost for each supplier
    const suppliersWithCosts = suppliers.map((supplier) => {
      const totalCost = calculateTotalCost(
        supplier,
        requirements,
        quantity,
        factoryLocation
      );
      return {
        supplier,
        totalCost,
      };
    });

    // Sort suppliers by total cost
    suppliersWithCosts.sort((a, b) => a.totalCost - b.totalCost);

    // Show results
    resultsDiv.classList.add('show');

    // Clear previous results
    locationsListDiv.innerHTML = '';

    // Generate HTML for each supplier
    suppliersWithCosts.forEach((item, index) => {
      const { supplier, totalCost } = item;

      // Calculate material costs separately
      const woodCost = supplier.pricePerUnit.wood * requirements.wood * quantity;
      const nailsCost = supplier.pricePerUnit.nails * requirements.nails * quantity;
      const polishCost = supplier.pricePerUnit.polish * requirements.polish * quantity;
      const transportCost = calculateTransportationCost(supplier.distance[factoryLocation]);

      // Create location card
      const locationCard = document.createElement('div');
      locationCard.className = 'location-card';

      // Add special class for best and second-best deals
      if (index === 0) {
        locationCard.classList.add('best-deal');
      } else if (index === 1) {
        locationCard.classList.add('second-best');
      }

      // Create location name with badge if applicable
      const locationNameDiv = document.createElement('div');
      locationNameDiv.className = 'location-name';
      locationNameDiv.textContent = supplier.name;

      if (index === 0) {
        const bestDealBadge = document.createElement('span');
        bestDealBadge.className = 'best-deal-badge';
        bestDealBadge.textContent = 'BEST DEAL';
        locationNameDiv.appendChild(bestDealBadge);
      } else if (index === 1) {
        const secondBestBadge = document.createElement('span');
        secondBestBadge.className = 'second-best-badge';
        secondBestBadge.textContent = 'SECOND BEST';
        locationNameDiv.appendChild(secondBestBadge);
      }

      // Create price
      const priceDiv = document.createElement('div');
      priceDiv.className = 'price';
      priceDiv.textContent = formatToRupees(totalCost);

      // Create details
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'details';

      detailsDiv.innerHTML = `
        <p>Wood (${requirements.wood * quantity} cubic meters): ${formatToRupees(woodCost)}</p>
        <p>Nails/Screws (${requirements.nails * quantity} kg): ${formatToRupees(nailsCost)}</p>
        <p>Polish (${requirements.polish * quantity} liters): ${formatToRupees(polishCost)}</p>
        <p>Transportation (${supplier.distance[factoryLocation]} km): ${formatToRupees(transportCost)}</p>
        <p>Distance from ${factoryLocationSelect.options[factoryLocationSelect.selectedIndex].text}: ${supplier.distance[factoryLocation]} km</p>
      `;

      // Append all elements to the location card
      locationCard.appendChild(locationNameDiv);
      locationCard.appendChild(priceDiv);
      locationCard.appendChild(detailsDiv);

      // Append the location card to the locations list
      locationsListDiv.appendChild(locationCard);
    });
  });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
