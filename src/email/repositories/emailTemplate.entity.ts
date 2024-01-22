import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class EmailTemplate{
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type:'text',nullable:true})
    templateId: string;
    @Column()
    mailSubject: string;
    @Column({length:"MAX"})
    mailBody: string;
    @Column({type:'text',nullable:true})
    createdBy: string;
    @Column({ type: 'datetime',nullable: true })
    createdDate: Date;
    @Column({type:'text',nullable: true})
    updatedBy: string;
    @Column({ type: 'datetime',nullable: true })
    updatedDate: Date;
}