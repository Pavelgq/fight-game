#include "MyCard.h"

MyCard::MyCard(std::string n, int t, int ds, int dm, int df, int c, int b, int o) :name(n),type(t),distance(ds),damage(dm), defense(df), cost(c), body(b), other(o)
{
	
}

void MyCard::print()
{
	std::cout << "----------------" << std:: endl;
	std::cout << "Name: " << name << std::endl;
	std::cout << "Type: " << type << std::endl;
	std::cout << "Distance: " << distance << std::endl;
	std::cout << "Damage: " << damage << std::endl;
	std::cout << "Defense: " << defense << std::endl;
	std::cout << "Cost: " << cost << std::endl;
	std::cout << "Body: " << body << std::endl;
	std::cout << "Other: " << other << std::endl;
	
}
