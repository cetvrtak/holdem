var slots = [p1c1,p1c2,p2c1,p2c2,flip_1,flip_2,flip_3,turn,river];
var cardsDealt = [];

var it = deal();
document.getElementById('deal').addEventListener("click", function () {
	it.next();
	if (document.getElementById("river").firstChild)
	{
		clearTable();
		it = deal();
		it.next();
	}
});

function *deal() {
	for (var slot of slots) {
		setTimeout(function() {
			var img = document.createElement("IMG");
			img.src = "images/deck/" + pickNewCard();
			img.style.width = '31px';
			img.style.height = '44px';
			img.style.borderRadius = '2px';
			document.getElementById(slot.id).appendChild(img);
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
	var newCard = randomRank() + "_of_" + randomSuit() + ".png";
	if (cardsDealt.includes(newCard))
	{
		pickNewCard();
	}
	cardsDealt.push(newCard);
	return newCard;
}

function randomRank() {
	var ranks = [2,3,4,5,6,7,8,9,10,"jack","queen","king","ace"];
	return ranks[Math.floor(Math.random() * ranks.length)];
};

function randomSuit() {
	var suits = ["hearts","spades","diamonds","clubs"];
	return suits[Math.floor(Math.random() * suits.length)];
};