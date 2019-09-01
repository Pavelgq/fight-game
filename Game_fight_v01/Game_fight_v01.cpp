// Game_fight_v01.cpp : Этот файл содержит функцию "main". Здесь начинается и заканчивается выполнение программы.
//

#include <iostream>
#include <time.h>   // time
#include <list>

#include "MyPlayer.h"
#include "MyCard.h"
#include "CardDesk.h"



int randDice(int n) { //Генератор броска n кубиков
	int k = 0;
	int s = 0;
	srand(time(0));
	for (int i = 0; i < n; ++i) {
		k = rand() % 6 + 1;
		s = s + k;
		std::cout << "Dice " << i + 1 << " = " << k << std::endl;
	}
	std::cout <<  "Total = "<< s << std::endl;
	return s;
}
int main()
{
    std::cout << "Hello World!\n";
	//int mas[9] = { 0 };

	//std::list<MyCard> c;
	//MyPlayer pl1(100, mas , c, w);

	//Создаем карты
	MyCard mas1 = {"Sad cudgel",1,2,7,0,2,2,0};
	MyCard mas2 = { "Bread knife",1,2,2,0,1,1,0 };
	MyCard mas3 = { "Katana of darkness",1,4,6,0,6,1,0 };
	MyCard mas4 = {"Nunchucks from Miki",1,2,4,0,3,2,0};
	MyCard mas5 = { "Baby bat",1,1,1,0,1,1,0 };
	
	MyCard card1 = { "Long leg",2,4,7,0,2,2,0 };
	MyCard card2 = { "Jaw kick",2,3,2,0,1,1,0 };
	MyCard card3 = { "Flying dragon",2,5,6,0,6,1,0 };
	MyCard card4 = { "Tiger shrimp",2,2,4,0,3,2,0 };
	MyCard card5 = { "Nipples in a vise",2,1,1,0,1,1,0 };

	CardDesk desk;
	desk.addCard(mas1);
	desk.addCard(mas2);
	desk.addCard(mas3);
	desk.addCard(mas4);
	desk.addCard(mas5);

	desk.print();
	system("pause");
	system("cls");
	desk.shuffle();
	
	desk.print();
}



// Запуск программы: CTRL+F5 или меню "Отладка" > "Запуск без отладки"
// Отладка программы: F5 или меню "Отладка" > "Запустить отладку"

// Советы по началу работы 
//   1. В окне обозревателя решений можно добавлять файлы и управлять ими.
//   2. В окне Team Explorer можно подключиться к системе управления версиями.
//   3. В окне "Выходные данные" можно просматривать выходные данные сборки и другие сообщения.
//   4. В окне "Список ошибок" можно просматривать ошибки.
//   5. Последовательно выберите пункты меню "Проект" > "Добавить новый элемент", чтобы создать файлы кода, или "Проект" > "Добавить существующий элемент", чтобы добавить в проект существующие файлы кода.
//   6. Чтобы снова открыть этот проект позже, выберите пункты меню "Файл" > "Открыть" > "Проект" и выберите SLN-файл.
