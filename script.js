document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

function fetchProducts() {
    fetch("http://localhost:5000/products")
        .then(response => response.json())
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

    fetch("http://localhost:5000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderQuantity })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchProducts(); // Refresh product list after order
    })
    .catch(error => console.error("Error placing order:", error));
}
