var slots = [p1c1,p1c2,p2c1,p2c2,flip_1,flip_2,flip_3,turn,river];
var cardsDealt = [];

var it = deal();
document.getElementById('deal').addEventListener("click", function () {
	it.next();
});

var bets = [];
var allBets = [];
var isInitialRoundOfBetting;
function *deal() {
	bets = [10, 5];
	allBets = [10, 5];
	for (var slot of slots) {
		setTimeout(function() {
			var img = document.createElement("IMG");
			img.src = "images/deck/" + pickNewCard();
			img.style.width = '31px';
			img.style.height = '44px';
			img.style.borderRadius = '2px';
			document.getElementById(slot.id).appendChild(img);
			if (slot.id != "flip_3" && slot.id != "turn" && slot.id != "river")
			{
				it.next();
			}
			else {
				isInitialRoundOfBetting = true;
				placeBet("p2");
			}
		}, 500);
		updateBets();
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

var playerLogging;
function sit(evt) {
	document.getElementById("username").value = "";
	document.getElementById("buyin").value = "";
	playerLogging = evt.target.id;
	var login = document.getElementById("login");
	login.style.display = "block";
}

document.getElementsByClassName("close")[0].addEventListener("click", function() {
	closeLogin();
})

function closeLogin() {
	var loginForm = document.getElementById("login");
	loginForm.style.display = "none";
}

function login() {
	document.getElementById(playerLogging + "_username").textContent = document.getElementById("username").value;

	var buyin = document.getElementById("buyin").value;
	document.getElementById(playerLogging + "_cash").textContent = "$" + buyin;

	placeChips(playerLogging, buyin);

	document.getElementById(playerLogging).style.display = "none";
	closeLogin();
}

function placeChips(player, amount) {
	let canvas = document.getElementById(player + "_stack");
	let ctx = canvas.getContext("2d");
	let img = new Image();
	img.src = "images/chipstacks/medium_t.png";

	img.onload = function() {
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	}
}

function updateBets() {
	let p1Bet = bets[0] != 0 ? "$" + bets[0] : "";
	document.getElementById("p1_bet").textContent = p1Bet;
	let p2Bet = bets[1] != 0 ? "$" + bets[1] : "";
	document.getElementById("p2_bet").textContent = p2Bet;
	document.getElementById("pot").textContent = "Pot: $" + allBets.reduce((sum, a) => sum + a, 0);
}

document.getElementById("p1_betAmount").addEventListener("change", function() {
	updateActionButton("p1");
});
document.getElementById("p2_betAmount").addEventListener("change", function() {
	updateActionButton("p2");
});
function placeBet(p) {
	document.getElementById(p + "_betPopup").style.display = "block";
	document.getElementById(p + "_betAmount").value = Math.abs(bets[0] - bets[1]);
	document.getElementById(p + "_betAmount").min = Math.abs(bets[0] - bets[1]);
	updateActionButton(p);
}

document.getElementById("p1_action").addEventListener("click", function() {
	submitBet("p1")
});
document.getElementById("p2_action").addEventListener("click", function() {
	submitBet("p2")
});
function submitBet(p) {
	let betAmount = +document.getElementById(p + "_betAmount").value;
	let playerIndex = p == "p1" ? 0 : 1;
	bets[playerIndex] += betAmount;
	allBets.push(betAmount);
	updateBets();
	document.getElementById(p + "_betPopup").style.display = "none";

	if (bets[0] != bets[1] || isInitialRoundOfBetting)
	{
		p = p == "p1" ? "p2" : "p1";
		placeBet(p);
		isInitialRoundOfBetting = false;
	}
	else if (!document.getElementById("river").firstChild)
	{
		bets = [0, 0];
		it.next();
	}
	else
	{
		declareWinner();
	}
}

function updateActionButton(p) {
	let betAmount = document.getElementById(p + "_betAmount").value;
	var actionType = document.getElementById(p + "_action");
	if (betAmount == 0)
	{
		actionType.textContent = "Check";
	}
	else if (betAmount == Math.abs(bets[0] - bets[1]))
	{
		actionType.textContent = "Call";
	}
	else
	{
		actionType.textContent = "Raise";
	}
}

function declareWinner() {
	clearTable();
	it = deal();
	it.next();
}