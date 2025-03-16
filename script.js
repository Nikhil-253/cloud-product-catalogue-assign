document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

const API_BASE_URL = "https://productcatalogueapp-e2f9eufwctghamcq.centralus-01.azurewebsites.net";

function fetchProducts() {
    fetch(`${API_BASE_URL}/products`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector("#productTable tbody");
            tableBody.innerHTML = ""; // Clear previous rows

            data.forEach(product => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td id="quantity-${product.id}">${product.quantity}</td>
                    <td>
                        <input type="number" id="order-${product.id}" min="1" max="${product.quantity}" value="1">
                        <button onclick="placeOrder(${product.id})">Order</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}

function placeOrder(productId) {
    const orderQuantity = document.getElementById(`order-${productId}`).value;

    fetch(`${API_BASE_URL}/order`, {  // ✅ Fixed URL issue
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderQuantity })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        fetchProducts(); // Refresh product list after order
    })
    .catch(error => console.error("Error placing order:", error));
}
