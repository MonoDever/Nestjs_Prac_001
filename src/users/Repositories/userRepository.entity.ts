import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserDirectory } from "./userDirectory.entity";
@Entity()
export class UserRepository {
    @PrimaryGeneratedColumn()
    id: number;
    @PrimaryColumn()
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
    @OneToOne(type => UserDirectory)
    @JoinColumn()
    userDirectory: UserDirectory
}