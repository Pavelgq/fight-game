#include "MyPlayer.h"

MyPlayer::MyPlayer(int h, int(&f)[9], CardDesk c, MyCard w) :health(h), fielts(f), cards(c), weapon(w)
{
	std::cout << "Player created successfully" << std::endl;
}
