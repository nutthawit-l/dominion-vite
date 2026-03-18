import artisanImg from '../assets/kingdoms/Artisan.jpg'
import banditImg from '../assets/kingdoms/Bandit.jpg'
import cellarImg from '../assets/kingdoms/Cellar.jpg'
import chapelImg from '../assets/kingdoms/Chapel.jpg'
import gardensImg from '../assets/kingdoms/Gardens.jpg'
import laboratoryImg from '../assets/kingdoms/Laboratory.jpg'
import remodelImg from '../assets/kingdoms/Remodel.jpg'
import sentryImg from '../assets/kingdoms/Sentry.jpg'
import vassalImg from '../assets/kingdoms/Vassal.jpg'
import workshopImg from '../assets/kingdoms/Workshop.jpg'

import copperImg from '../assets/basics/Copper.jpg'
import silverImg from '../assets/basics/Silver.jpg'
import goldImg from '../assets/basics/Gold.jpg'
import estateImg from '../assets/basics/Estate.jpg'
import duchyImg from '../assets/basics/Duchy.jpg'
import provinceImg from '../assets/basics/Province.jpg'
import curseImg from '../assets/basics/Curse.jpg'

export type CardType =
    | "ACTION"
    | "ACTION_ATTACK"
    | "TREASURE"
    | "VICTORY"
    | "CURSE";

export interface Card {
    name: string;
    cost: number;
    type: CardType;
    count: number;
    img: string;
}

export const artisan: Card = {
    name: "Artisan",
    cost: 6,
    type: "ACTION",
    count: 10,
    img: artisanImg
};

export const bandit: Card = {
    name: "Bandit",
    cost: 5,
    type: "ACTION_ATTACK",
    count: 10,
    img: banditImg
};

export const cellar: Card = {
    name: "Cellar",
    cost: 2,
    type: "ACTION",
    count: 10,
    img: cellarImg
};

export const chapel: Card = {
    name: "Chapel",
    cost: 2,
    type: "ACTION",
    count: 10,
    img: chapelImg
};

export const gardens: Card = {
    name: "Gardens",
    cost: 4,
    type: "VICTORY",
    count: 10,
    img: gardensImg
};

export const laboratory: Card = {
    name: "Laboratory",
    cost: 5,
    type: "ACTION",
    count: 10,
    img: laboratoryImg
};

export const remodel: Card = {
    name: "Remodel",
    cost: 4,
    type: "ACTION",
    count: 10,
    img: remodelImg
};

export const sentry: Card = {
    name: "Sentry",
    cost: 5,
    type: "ACTION",
    count: 10,
    img: sentryImg
};

export const vassal: Card = {
    name: "Vassal",
    cost: 3,
    type: "ACTION",
    count: 10,
    img: vassalImg
};

export const workshop: Card = {
    name: "Workshop",
    cost: 3,
    type: "ACTION",
    count: 10,
    img: workshopImg
};

export const copper: Card = {
    name: "Copper",
    cost: 0,
    type: "TREASURE",
    count: 60,
    img: copperImg
};

export const silver: Card = {
    name: "Silver",
    cost: 3,
    type: "TREASURE",
    count: 40,
    img: silverImg
};

export const gold: Card = {
    name: "Gold",
    cost: 6,
    type: "TREASURE",
    count: 30,
    img: goldImg
};

export const estate: Card = {
    name: "Estate",
    cost: 2,
    type: "VICTORY",
    count: 8,
    img: estateImg
};

export const duchy: Card = {
    name: "Duchy",
    cost: 5,
    type: "VICTORY",
    count: 8,
    img: duchyImg
};

export const province: Card = {
    name: "Province",
    cost: 8,
    type: "VICTORY",
    count: 8,
    img: provinceImg
};

export const curse: Card = {
    name: "Curse",
    cost: 0,
    type: "CURSE",
    count: 10,
    img: curseImg
};

export const KINGDOM_CARDS = [
    artisan, bandit, cellar, chapel, gardens, laboratory, remodel, sentry, vassal, workshop
];

export const BASIC_CARDS = [
    province, gold, duchy, silver, estate, copper, curse
];