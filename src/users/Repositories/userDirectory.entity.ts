import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { RegularEntity } from "src/common/entities/regularEntity";
@Entity()
export class UserDirectory extends RegularEntity{
    @PrimaryGeneratedColumn()
    id: number;
    @PrimaryColumn()
    userId: string;
    @Column({length: 150,nullable: true})
    firstname: string;
    @Column({length: 150,nullable: true})
    lastname: string;
    @Column({length: 150,})
    email: string;
    @Column({length:150,nullable:true})
    phone: string;
}