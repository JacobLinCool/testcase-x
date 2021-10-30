// Copyright (c) Howchien<https://github.com/howard9199>

#include <stdio.h>

int UI_inputCard(int i) {
    int inputCard;
    if (i == 1) {
        printf("1st card: ");
    }
    else if (i == 2) {
        printf("2nd card: ");
    }
    else if (i == 3) {
        printf("3rd card: ");
    }
    else if (i < 10) {
        printf("%dth card: ", i);
    }
    else {
        printf("%d th card: ", i);
    }
    scanf("%d", &inputCard);
    return inputCard;
}
int addHCP(int cardNum) {
    cardNum -= ((cardNum - 1) / 13) * 13;
    switch (cardNum) {
    case 1:
        return 4;
    case 11:
        return 1;
    case 12:
        return 2;
    case 13:
        return 3;
    default:
        return 0;
    }
}
int least_num(int numOfSuit[], int least) {
    for (int i = 0; i < 4; i++) {
        if (i == 3 && least == 6)return -1;
        if (numOfSuit[i] >= least) {
            return i;
        }
    }
    return -1;
}
int suitIsMost(int suit, int numOfSuit[]) {
    for (int i = 0; i < 4; i++) {
        if (numOfSuit[suit] < numOfSuit[i]) {
            return 0;
        }
    }
    return 1;
}
void biddingChoice(int HCP, int numOfSuit[]) {
    printf("The bidding choice : ");
    if (HCP >= 22) {
        printf("2C");
    }
    else if (13 <= HCP &&
        ((numOfSuit[0] >= 5 && suitIsMost(0, numOfSuit)) || (numOfSuit[1] >= 5 && suitIsMost(1, numOfSuit)))) {
        if (numOfSuit[0] >= numOfSuit[1]) {
            printf("1S");
        }
        else {
            printf("1H");
        }
    }
    else if (16 <= HCP && HCP <= 18) {
        printf("1NT");
    }
    else if (20 <= HCP && HCP <= 21) {
        printf("2NT");
    }
    else if (13 <= HCP &&
        ((numOfSuit[2] >= 3 && suitIsMost(2, numOfSuit)) || (numOfSuit[3] >= 3 && suitIsMost(3, numOfSuit)))) {
        if (numOfSuit[2] >= numOfSuit[3]) {
            printf("1D");
        }
        else {
            printf("1C");
        }
    }
    else if (10 <= HCP && HCP <= 12 &&
        least_num(numOfSuit, 7) != -1) {
        switch (least_num(numOfSuit, 7)) {
        case 0:
            printf("3S");
            break;
        case 1:
            printf("3H");
            break;
        case 2:
            printf("3D");
            break;
        case 3:
            printf("3C");
            break;
        }
    }
    else if (10 <= HCP && HCP <= 12 &&
        least_num(numOfSuit, 6) != -1) {
        switch (least_num(numOfSuit, 6)) {
        case 0:
            printf("2S");
            break;
        case 1:
            printf("2H");
            break;
        case 2:
            printf("2D");
            break;
        }
    }
    else {
        printf("Pass");
    }
    printf("\n");
    return;
}
int main() {
    //freopen("hw0205.in","r",stdin);
    int nowCard;
    int HCP = 0;
    int numOfSuit[4] = { 0,0,0,0 };

    for (int i = 1; i <= 13; i++) {
        nowCard = UI_inputCard(i);
        if (nowCard < 1 || nowCard > 52) {
            printf("Error\n");
            return 0;
        }
        numOfSuit[(nowCard - 1) / 13]++;
        HCP += addHCP(nowCard);
    }
    printf("---\n");
    printf("HCP: %d pts\n", HCP);
    printf("Suit: %d-%d-%d-%d\n", numOfSuit[0], numOfSuit[1], numOfSuit[2], numOfSuit[3]);
    biddingChoice(HCP, numOfSuit);

    return 0;
}