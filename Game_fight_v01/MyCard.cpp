#include "MyCard.h"

MyCard::MyCard(int t, int ds, int dm, int df, int o) :type(t),distance(ds),damage(dm), defense(df), other(o)
{

}

void MyCard::print()
{
	std::cout << "----------------" << std:: endl;
	std::cout << "Type: " << type << std::endl;
	std::cout << "Distance: " << distance << std::endl;
	std::cout << "Damage: " << damage << std::endl;
	std::cout << "Defense: " << defense << std::endl;
	std::cout << "Other: " << other << std::endl;
	std::cout << "----------------" << std::endl;
}
