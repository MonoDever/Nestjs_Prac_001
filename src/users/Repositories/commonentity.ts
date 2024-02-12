import { Column } from "typeorm";

export class commonentity{
    @Column('text')
    createdBy: string;
    @Column({ type: 'datetime' })
    createdDate: Date;
    @Column({type:'text',nullable: true})
    updatedBy: string;
    @Column({ type: 'datetime',nullable: true })
    updatedDate: Date;
}