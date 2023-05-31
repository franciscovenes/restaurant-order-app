import { menuArray } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

let itemsInOrder = [];

let checkoutSection = document.getElementById("checkout");
let paymentModal = document.getElementById("payment-modal");

window.addEventListener("load", function () {
  addMenuItems();
});

function addMenuItems() {
  let itemsInMenu = ``;
  menuArray.forEach(function (item) {
    itemsInMenu += `
<div id="${item.id}" class="item">
    <div class="item-emoji"><span>${item.emoji}</span></div>
    <div class="item-details">
      <h2>${item.name}</h2>
      <p class="item-ingredients">${item.ingredients.join(", ")}</p>
      <p class="item-price">$${item.price}</p>
    </div>
    <button class="item-btn bg-btn">+</button>
</div>`;
  });
  document.querySelector(".items-list").innerHTML = itemsInMenu;
  render();
}

/* Event listeners for page interaction */

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("item-btn")) {
    // Add item to order buttons
    let item = menuArray.filter(function (item) {
      return item.id === Number(e.target.parentElement.id);
    })[0];
    addToOrder(item);
  } else if (e.target.dataset.remove) {
    // Remove item from order buttons
    removeItemFromOrder(e.target.dataset.remove);
  } else if (e.target.dataset.decrement) {
    // Decrement item from order buttons
    decrementQty(e.target.dataset.decrement);
  } else if (e.target.dataset.increment) {
    // Add item to order buttons
    incrementQty(e.target.dataset.increment);
  } else if (e.target.id === "order-btn") {
    // Open payment modal
    toggleModal();
  } else if (e.target.id === "modal-close-btn") {
    // Close payment modal
    toggleModal();
  }
});

function addToOrder(item) {
  let itemObj = {};
  let index = itemsInOrder.findIndex(function (obj) {
    return obj.name === item.name;
  });

  if (index === -1) {
    itemObj = {
      name: item.name,
      price: item.price,
      qty: 1,
      id: item.id,
      uuid: uuidv4(),
    };
    itemsInOrder.push(itemObj);
  } else {
    itemsInOrder[index] = {
      ...itemsInOrder[index],
      qty: ++itemsInOrder[index].qty,
    };
  }

  render();
}

function removeItemFromOrder(itemId) {
  const itemIndex = itemsInOrder.findIndex(function (item) {
    return item.uuid === itemId;
  });
  itemsInOrder.splice(itemIndex, 1);
  render();
}

function decrementQty(itemId) {
  const itemIndex = itemsInOrder.findIndex(function (item) {
    return item.uuid === itemId;
  });

  if (itemsInOrder[itemIndex].qty > 1) {
    itemsInOrder[itemIndex].qty--;
  } else {
    removeItemFromOrder(itemId);
  }

  render();
}

function incrementQty(itemId) {
  const itemIndex = itemsInOrder.findIndex(function (item) {
    return item.uuid === itemId;
  });

  itemsInOrder[itemIndex].qty++;
  render();
}

function toggleModal() {
  paymentModal.classList.toggle("payment-modal-visible");
  document.querySelectorAll(".bg-btn").forEach(function (btn) {
    btn.classList.toggle("disable-btn");
  });
}

document.getElementById("client-form").addEventListener("submit", function (e) {
  e.preventDefault();
  payOrder();
});

function payOrder() {
  const clientName = document.querySelector('input[name="client-name"]').value;
  toggleModal();
  itemsInOrder = [];
  checkoutSection.innerHTML = `
<div class="after-payment">
<p> ¡Gracias, ${clientName}! Tu pedido está en camino 🤩</p>
</div>
    `;
}

function getOrderHtml() {
  let orderHtml = "";
  if (itemsInOrder.length > 0) {
    orderHtml += `<h2 class="checkout-title">Su pedido</h2>`;

    let totalPrice = 0;

    // Render checkout items

    itemsInOrder.forEach(function (item) {
      totalPrice += item.price * item.qty;
      orderHtml += `
      <div class="checkout-items">
          <h2>${item.name}</h2>
          <button class="bg-btn" data-remove="${item.uuid}">cancelar</button>
          <div>
            <i class="fa-solid fa-minus" data-decrement="${item.uuid}"></i> 
            <p class="item-qty">ctd: ${item.qty}</p>
            <i class="fa-solid fa-plus" data-increment="${item.uuid}"></i>
          </div>
          
          <p class="item-price">$${item.price * item.qty}</p>
          
      </div>`;
    });

    // Apply Discount of 2$ for each combo of encebollado: 1 encebollado + 1 coconut juice + 1 chifle
    // filter itemsInOrder to include discount items only
    const discount = itemsInOrder.filter(function (item) {
      return [0, 5, 7].includes(item.id);
    });

    // obtain lowest quantity among discount items and apply it

    let discountAmount = 0;

    if (discount.length === 3) {
      discountAmount = discount.reduce(function (previous, current) {
        if (current.qty < previous.qty) {
          return current;
        } else {
          return previous;
        }
      }).qty;

      // Apply discount
      totalPrice -= discountAmount * 2;

      // Render discount message
      orderHtml += `
  <div class="discount">
    <p class="discount-message">🤩 Descuento de por llevar ${discountAmount} combo(s) de encebollado (🍲 + 🍟 + 🥤)</p>
    <p class="item-price">- $${discountAmount * 2}</p>
  </div>`;
    }

    // Render final price and payment button
    orderHtml += `
      <div class="checkout-items">
          <h2>Precio final</h2>
          <p class="item-price">$${totalPrice}</p>
      </div>
      <button id="order-btn" class="order-btn bg-btn">Finalizar pedido</button>`;
  } else {
    // Render empty order message
    orderHtml += `
<div class="empty-order">
<i class="fa-solid fa-bowl-food"></i>
<p>Por favor, escoja algo en el menú para iniciar su pedido...</p>
</div>`;
  }

  return orderHtml;
}

function render() {
  checkoutSection.innerHTML = getOrderHtml();
}
