import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

enum WXCodeType {
    MICRO_CODE = 1,
    QR_CODE = 2
}

interface ExportOption {
    code_type: WXCodeType
}

@Entity('mzg_batch')
export class BatchModel {
    @PrimaryGeneratedColumn({ comment: '批次id' })
    batch_id: number

    @Column('int4', { nullable: false, comment: '公司id' })
    enterprise_id: number

    @Column('string', { nullable: false, comment: '批次名称' })
    batch_name: string

    @Column('int8', { nullable: false, comment: '码数量' })
    code_count: number

    @Column('int8', { nullable: false, comment: '生码数量' })
    gen_code_count: number

    @Column('int2', { nullable: false, comment: '损耗率 单位: 0.01%' })
    loss_rate: number

    @Column('int2', {
        nullable: false,
        comment:
            '标类型: 1.单标(1个内码) 2.双标(1个内码+1个外码) 3.套标(1个箱码+N个内码+N个外码)'
    })
    label_type: number

    @Column('int8', { nullable: true, comment: '微信申请单号' })
    application_id: number

    @Column('string', { nullable: true, comment: '微信外部申请单号' })
    isv_application_id: string

    @Column('int2', {
        nullable: false,
        comment: '码类型: 1.微信微型码 2.码总管自定义'
    })
    code_type: number

    @Column('string', { nullable: false, comment: '关联的订单号' })
    order_no: string

    @Column('int4', { nullable: true, comment: '关联的商品id' })
    product_id: number

    @Column('timestamptz', { nullable: true, comment: '激活时间' })
    activate_time: Date

    @Column('int2', {
        nullable: false,
        comment:
            '批次状态: 0.初始状态 1.已向微信申请生码，微信生码中 2.微信生码完毕，物流码生码中 3.物流码生码完毕，导出cos中 4.导出成功等待激活 5.已激活 6.已关闭'
    })
    batch_status: number

    @Column('int2', {
        nullable: false,
        comment: '下载状态: 0.不可下载 1.可下载'
    })
    download_status: number

    @Column('int4', { nullable: false, comment: '下载次数' })
    download_times: number

    @Column('string', { nullable: true, comment: '解压密码' })
    unzip_password: string

    @Column('jsonb', { nullable: false, comment: '需要导出的列' })
    export_column: {
        pallet_code?: ExportOption
        box_code?: ExportOption
        casket_code?: ExportOption
        outside_code?: ExportOption
        inside_code: ExportOption
    }
}
