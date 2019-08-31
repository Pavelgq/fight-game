#include "CardDesk.h"

CardDesk::CardDesk(std::list<MyCard> k) :cards(k)
{

}

void CardDesk::addCard(MyCard card)
{
	cards.push_back(card);
}

MyCard CardDesk::takeCard()
{
	auto it = cards.begin();
	MyCard take = *it;
	cards.pop_front();
	return take;
}

void CardDesk::shuffle()
{
	srand(time(0));
	std::mt19937 gen(std::chrono::system_clock::now().time_since_epoch().count());
	std::vector<MyCard> V(cards.begin(), cards.end());
	std::shuffle(V.begin(), V.end(), gen);
	cards.assign(V.begin(), V.end());
	

}

void CardDesk::print()
{
	int k = 0;
	for (auto i = cards.begin(); i != cards.end(); ++i) {
		k++;
		(*i).print();
	}
}
