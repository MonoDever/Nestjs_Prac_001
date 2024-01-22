import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SentEmailLog{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    templateId: string;
    @Column()
    mailSubject: string;
    @Column({length:"MAX"})
    mailBody: string;
    @Column()
    mailTo: string;
    @Column({ type: 'datetime',nullable: true })
    sentDate: Date;
    @Column({type:'text',nullable:true})
    createdBy: string;
    @Column({ type: 'datetime',nullable: true })
    createdDate: Date;
    @Column({type:'text',nullable: true})
    updatedBy: string;
    @Column({ type: 'datetime',nullable: true })
    updatedDate: Date;
}