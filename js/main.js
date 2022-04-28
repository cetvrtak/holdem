var slots = [p1c1,p1c2,p2c1,p2c2,flip_1,flip_2,flip_3,turn,river];
var cardsDealt = [];

var tableCnv = document.getElementById("table_img");
var tableCtx = tableCnv.getContext("2d");
var tableImg = new Image();
tableImg.src = "images/table_trimmed_rotated.png";
tableImg.onload = function() {
	tableCnv.width = tableImg.width;
	tableCnv.height = tableImg.height;
	tableCtx.drawImage(tableImg, 0, 0, tableCnv.width, tableCnv.height);
};

var it = deal();
document.getElementById('deal').addEventListener("click", function () {
	event.target.style.display = "none";
	it.next();
});

var bets = {};
var allBets = [];
var isInitialRoundOfBetting;
var dealer;
function *deal() {
	let smallBlind = getNextPlayer(dealer);
	let bigBlind = getNextPlayer(smallBlind);
	bets[smallBlind] = 5;
	bets[bigBlind] = 10;
	allBets = [bets[smallBlind], bets[bigBlind]];
	for (const p in players)
	{
		players[p].cash -= bets[p];
	}
	for (var slot of slots) {
		setTimeout(function() {
			var img = document.createElement("IMG");
			img.src = "images/deck/" + pickNewCard();
			img.style.width = '31px';
			img.style.height = '44px';
			img.style.borderRadius = '2px';
			document.getElementById(slot.id).appendChild(img);
			if (slot.id != "p2c2" && slot.id != "flip_3" && slot.id != "turn" && slot.id != "river")
			{
				it.next();
			}
			else {
				isInitialRoundOfBetting = true;
				placeBet(smallBlind);
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
	document.getElementById("main_menu").style.display = "block";
})

function closeLogin() {
	document.getElementById("login").style.display = "none";
}

var players = {};
function login() {
	let player = {
		username: document.getElementById("username").value,
		cash: +document.getElementById("buyin").value
	}
	players[playerLogging] = player;
	if (!dealer)
	{
		dealer = playerLogging;
	}

	document.getElementById(playerLogging).style.display = "none";
	closeLogin();

	if (singlePlayer)
	{
		players["p2"] = { username: "john_doe", cash: player.cash };
	}

	updatePlayers();
}

function updatePlayers() {
	for (const player in players) {
		let username = document.getElementById(player + "_username");
		username.textContent = players[player].username;
		username.style.display = "block";

		document.getElementById(player + "_cash").textContent = "$" + players[player].cash;

		placeChips(player, players[player].cash);
		if (Object.keys(players).length > 1)
		{
			document.getElementById("deal").style.display = "block";
		}
	}
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
	for (const p in players)
	{
		let bet = bets[p] != 0 ? "$" + bets[p] : "";
		document.getElementById(p + "_bet").textContent = bet;
		document.getElementById(p + "_cash").textContent = players[p].cash;
	}
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
	document.getElementById(p + "_betAmount").value = Math.abs(bets[p] - getMaxBet());
	document.getElementById(p + "_betAmount").min = Math.abs(bets[p] - getMaxBet());
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
	bets[p] += betAmount;
	players[p].cash -= betAmount;
	allBets.push(betAmount);
	updateBets();
	document.getElementById(p + "_betPopup").style.display = "none";

	let next = getNextPlayer(p);
	if (bets[next] != getMaxBet() || isInitialRoundOfBetting)
	{
		placeBet(next);
		isInitialRoundOfBetting = false;
	}
	else if (!document.getElementById("river").firstChild)
	{
		clearBets();
		it.next();
	}
	else
	{
		declareWinner("p2");
		dealer = getNextPlayer(dealer);
	}
}

function updateActionButton(p) {
	let betAmount = document.getElementById(p + "_betAmount").value;
	var actionType = document.getElementById(p + "_action");
	if (betAmount == 0)
	{
		actionType.textContent = "Check";
	}
	else if (betAmount == Math.abs(bets[p] - getMaxBet()))
	{
		actionType.textContent = "Call";
	}
	else
	{
		actionType.textContent = "Raise";
	}
}

function declareWinner(p) {
	let popup = document.getElementById(p + "_winPopup");
	let pot = allBets.reduce((sum, a) => sum + a, 0);
	players[p].cash += pot;
	popup.textContent = "You won! $" + pot;
	popup.style.display = "block";

	setTimeout(function() {
		popup.style.display = "none";
		document.getElementById(p + "_cash").textContent = "$" + players[p].cash;
		clearTable();
		it = deal();
		it.next();
	}, 3000);
}

var singlePlayer;
document.getElementById("single_player").addEventListener("click", function() {
	singlePlayer = true;
	document.getElementById("players").style.display = "block";
	document.getElementById("main_menu").style.display = "none";

	// Automatically log players in
	var p1 = document.getElementById("p1");
	p1.click();
	p1.style.display = "none";
	document.getElementById("p2").style.display = "none";
});

document.getElementById("multi_player").addEventListener("click", function() {
	document.getElementById("players").style.display = "block";
	document.getElementById("main_menu").style.display = "none";
});

function getNextPlayer(p) {
	for (const player in players)
	{
		if (player > p) return player;
	}
	return "p1";
}

function getMaxBet() {
	let arr = Object.values(bets);
	return Math.max(...arr);
}

function clearBets() {
	for (const p in players)
	{
		bets[p] = 0;
	}
}