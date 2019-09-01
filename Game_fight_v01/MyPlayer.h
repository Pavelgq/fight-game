#pragma once
#include "MyCard.h"
#include "CardDesk.h"

#include <iostream>
#include <list>

class MyPlayer
{
	friend MyCard;
	friend CardDesk;

	int health;
	int (&fielts)[9];
	CardDesk cards;
	MyCard weapon;
public:
	MyPlayer(int h, int (&f)[9], CardDesk c, MyCard w);

	//Метод для выбора оружия


	//Метод для случайного выбора начальных карт

	
};

