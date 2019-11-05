const validateEl = document.getElementById("validate");
const resultEl = document.getElementById("result");
const inputVal = document.getElementById("input");

validateEl.addEventListener("click", () => {
	if (validate(inputVal.value)) {
		resultEl.innerHTML = "Valid Credit Card Number";
	} else {
		resultEl.innerHTML = "Card Number Not Valid";
	}
});

inputVal.addEventListener("keyup", event => {
	if (event.keyCode === 13) {
		validateEl.click();
	}
});

const to_digits = numString =>
	numString
		.replace(/[^0-9]/g, "")
		.split("")
		.map(Number);

const condTransform = (predicate, value, fn) => {
	if (predicate) {
		return fn(value);
	} else {
		return value;
	}
};

const doubleEveryOther = (current, idx) =>
	condTransform(idx % 2 === 0, current, x => x * 2);

const reduceMultiDigitVals = current =>
	condTransform(current > 9, current, x => x - 9);

const validate = numString => {
	const digits = to_digits(numString);
	const len = digits.length;
	const luhn_digit = digits[len - 1];

	const total = digits
		.slice(0, len - 1)
		.reverse()
		.map(doubleEveryOther)
		.map(reduceMultiDigitVals)
		.reduce((acc, cur) => acc + cur, luhn_digit);

	return total % 10 === 0;
};
