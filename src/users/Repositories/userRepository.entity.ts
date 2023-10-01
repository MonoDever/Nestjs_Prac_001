import { type } from "os";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserRepository {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    userId: string;
    @Column({ length: 150 })
    username: string;
    @Column('text') 
    password: string;
    @Column({type:'text',nullable: true})
    refresh: string;
    @Column()
    isActive: boolean;
    @Column('text')
    createdBy: string;
    @Column({ type: 'datetime' })
    createdDate: Date;
    @Column({type:'text',nullable: true})
    updatedBy: string;
    @Column({ type: 'datetime',nullable: true })
    updatedDate: Date;
}