#pragma once
#include <list>
#include <time.h>
#include<vector>
#include<chrono>
#include<algorithm>
#include<random>
#include <iostream>

#include "MyCard.h"


class CardDesk
{
	friend MyCard;

	std::list<MyCard> cards;

public:
	CardDesk();
	CardDesk(std::list<MyCard> с);

	void addCard(MyCard);
	MyCard takeCard();
	void shuffle(); //Перемешать колоду

	void print(); //Вывод колоды в консоль


};

