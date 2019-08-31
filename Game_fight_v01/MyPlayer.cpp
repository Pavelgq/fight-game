#include "MyPlayer.h"

MyPlayer::MyPlayer(int h, int(&f)[9], std::list<MyCard> c) :health(h), fielts(f), cards(c)
{
	std::cout << "Player created successfully" << std::endl;
}
