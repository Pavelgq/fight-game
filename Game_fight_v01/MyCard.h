#pragma once
#include <iostream>
#include <string>

class MyCard
{
	std::string name; //Название
	int type; //Тип (оружие, прием и т.д.)
	int distance; //Дистанция действия
	int damage; //Урон
	int defense; //Защитные качества
	int cost; // Вес/Стоимость
	int body; //Какая часть тела задействована
	int other; //Другое, доп. эффекты
	
public:
	MyCard(std::string, int, int, int, int, int, int, int);
	void print();
};

