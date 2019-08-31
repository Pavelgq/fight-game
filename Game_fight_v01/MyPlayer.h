#pragma once
#include "MyCard.h"

#include <iostream>
#include <list>

class MyPlayer
{
	friend MyCard;

	int health;
	int (&fielts)[9];
	std::list<MyCard> cards;
public:
	MyPlayer(int h, int (&f)[9], std::list<MyCard> c);

	//Метод для выбора оружия


	//Метод для случайного выбора начальных карт

	
};

