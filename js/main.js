var slots = [p1c1,p1c2,p2c1,p2c2,flip_1,flip_2,flip_3,turn,river];
var cardsDealt = [];

var it = deal();
document.getElementById('deal').addEventListener("click", function () {
	it.next();
	if (document.getElementById("river").textContent != "")
	{
		clearTable();
		it = deal();
		it.next();
	}
});

function *deal() {
	for (var slot of slots) {
		setTimeout(function() {
			document.getElementById(slot.id).textContent = pickNewCard();
			if (slot.id != "flip_3" && slot.id != "turn")
			{
				it.next();
			}
		}, 500);
		yield;
	};
};

function clearTable() {
	for (var slot of slots) {
		document.getElementById(slot.id).textContent = "";
	}
}

function pickNewCard() {
	var newCard = randomNum() + randomSuit();
	if (newCard in cardsDealt)
	{
		pickNewCard();
	}
	cardsDealt.push(newCard);
	return newCard;
}

function randomNum() {
	var numbers = [2,3,4,5,6,7,8,9,10,"J","Q","K","A"];
	return numbers[Math.floor(Math.random() * numbers.length)];
};

function randomSuit() {
	var suits = ["H","S","T","C"];
	return suits[Math.floor(Math.random() * suits.length)];
};