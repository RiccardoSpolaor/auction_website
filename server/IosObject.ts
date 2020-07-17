import {Insertion} from './Insertion';
import * as insertion from './Insertion';

enum Kinds{
    auctionEnded = "auctionEnded"
}

export class IosObject {

    constructor(private kind: Kinds, ) {
        
    }
} 


export class AuctionEnded{
    private insertion;
    private insertionist;
    private winner;


    constructor(document: Insertion){
        
        this.insertion = document.id;
        this.insertionist = document.insertionist;
        this.winner = document.current_winner;
    }

}