// Copyright (c) JacobLinCool<https://github.com/JacobLinCool>

#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main() {
    int32_t cards[13] = { 0 };

    for (int8_t i = 0; i < 13; i++) {
        printf("%d%s card: ", i + 1, (i == 0) ? "st" : (i == 1) ? "nd" : (i == 2) ? "rd" : "th");
        if (scanf("%d", &cards[i]) != 1 || cards[i] < 1 || cards[i] > 52) {
            printf("Invalid Input!\n");
            return 1;
        }
    }
    printf("---\n");

    // suit[0] = "Spades", suit[1] = "Hearts", suit[2] = "Diamonds", suit[3] = "Clubs";
    int32_t hcp = 0, suit[4] = { 0 };

    // calculate HCP
    for (int8_t i = 0; i < 13; i++) {
        if (cards[i] % 13 == 1) hcp += 4;
        else if (cards[i] % 13 == 0) hcp += 3;
        else if (cards[i] % 13 == 12) hcp += 2;
        else if (cards[i] % 13 == 11) hcp += 1;
    }

    // calculate suit
    for (int8_t i = 0; i < 13; i++) suit[(cards[i] - 1) / 13]++;

    printf("HCP: %d pts\n", hcp);
    printf("Suit: %d-%d-%d-%d\n", suit[0], suit[1], suit[2], suit[3]);

    // Apply Rule 8 if there is no other conditions are satisfied 
    char choice[5];

    // Rule 1
    if (hcp >= 22) strcpy(choice, "2C");
    // Rule 2
    else if (suit[0] >= 5 && (suit[0] >= suit[1] && suit[0] >= suit[2] && suit[0] >= suit[3]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1S");
    else if (suit[1] >= 5 && (suit[1] >= suit[0] && suit[1] >= suit[2] && suit[1] >= suit[3]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1H");
    // Rule 3
    else if (16 <= hcp && hcp <= 18) strcpy(choice, "1NT");
    // Rule 4
    else if (20 <= hcp && hcp <= 21) strcpy(choice, "2NT");
    // Rule 5
    else if (suit[2] >= 3 && (suit[2] >= suit[0] && suit[2] >= suit[1] && suit[2] >= suit[3]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1D");
    else if (suit[3] >= 3 && (suit[3] >= suit[0] && suit[3] >= suit[1] && suit[3] >= suit[2]) && 13 <= hcp && hcp <= 21) strcpy(choice, "1C");
    // Rule 6
    else if (suit[0] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3S");
    else if (suit[1] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3H");
    else if (suit[2] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3D");
    else if (suit[3] >= 7 && 10 <= hcp && hcp <= 12) strcpy(choice, "3C");
    // Rule 7
    else if (suit[0] >= 6 && 10 <= hcp && hcp <= 12) strcpy(choice, "2S");
    else if (suit[1] >= 6 && 10 <= hcp && hcp <= 12) strcpy(choice, "2H");
    else if (suit[2] >= 6 && 10 <= hcp && hcp <= 12) strcpy(choice, "2D");
    else strcpy(choice, "Pass");

    printf("The bidding choice : %s\n", choice);

    return 0;
}
