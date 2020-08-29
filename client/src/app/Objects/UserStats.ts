
export interface StudentStats {
    insertion_list: [{
        _id: string,
        title: string
    }],
    participation_list: [{
        _id: string,
        title: string
    }],
    winner_list: [{
        _id: string,
        title: string
    }]
}


export interface ModStats {
    active_insertion_list: number,
    completed_insertion_list: number,
    unsuccesfully_completed_insertion_list: number
    }

