import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinTable} from "typeorm";

@Entity()
export default class Recipe {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({type: "datetime"}) //tyme: "timestamp"
    creation: Date;
    
    @UpdateDateColumn({type: "datetime"}) //tyme: "timestamp"
    update: Date;

    @Column()
    title: string;
    @Column()
    subtitle: string;
    @Column()
    from: string;
    @Column()
    ingredients: string;
    @Column()
    method: string;
    @Column()
    notes: string;
}
