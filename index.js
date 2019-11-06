const lookup = require("binlookup")();

//bank.name & country.name & scheme & type
// AMEX =
// Visa =
// MCard =

const validate = require("./validate");
const validateEl = document.getElementById("validate");
const resultEl = document.getElementById("result");
const merchantEl = document.getElementById("merchant");
const inputVal = document.getElementById("input");

validateEl.addEventListener("click", () => {
	merchantEl.innerHTML = "";
	const firstEight = inputVal.value.substring(0, 8);
	//console.log(firstEight);
	const fetchData = async () => {
		const result = await lookup(firstEight);
		const name = result.bank.name;
		const country = result.country.name;
		const { scheme, type } = result;

		const icon =
			scheme === "amex"
				? '<i class="fab fa-cc-amex fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country
				: scheme === "visa"
				? '<i class="fab fa-cc-visa fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country
				: scheme === "mastercard"
				? '<i class="fab fa-cc-mastercard fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country
				: '<i class="fas fa-credit-card fa-4x"></i> ' +
				  "</br>" +
				  name +
				  ", " +
				  country;

		merchantEl.innerHTML = icon;
	};

	if (validate(inputVal.value)) {
		resultEl.innerHTML = "Valid Credit Card Number";
		fetchData();
	} else {
		resultEl.innerHTML = "Card Number Not Valid";
	}
});

inputVal.addEventListener("keyup", event => {
	if (event.keyCode === 13) {
		validateEl.click();
	}
});
