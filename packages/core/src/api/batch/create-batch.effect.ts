import { HttpError, HttpStatus, EffectFactory, use } from '@marblejs/core'
import { requestValidator$, t } from '@marblejs/middleware-io'
import { throwError, of, from } from 'rxjs'
import { mergeMap, map, catchError } from 'rxjs/operators'
import { getRepository } from 'typeorm'
import { neverNullable } from '@mazongguan-common/filter'
import { option } from 'io-ts-types/lib/option'
import { optional } from '@mazongguan-common/validator'
import { BatchModel } from '../../model'
// import { validator$, Joi } from '@marblejs/middleware-joi'
import { validator$, Joi } from '@yeongjet/middleware-joi'
// const validator$ = requestValidator$({
//     body: t.intersection([
//         t.type({
//             enterprise_id: t.number,
//             batch_name: t.string,
//             code_count: t.number,
//             loss_rate: t.number,
//             label_type: t.number,
//             application_id: t.string,
//             isv_application_id: t.string,
//             code_type: t.number,
//             product_id: t.number
//         }),
//         t.partial({
//             export_column: t.type({
//                 inside_code: t.type({
//                     code_type: t.number
//                 })
//             })
//         })
//     ])
// })

const validator = validator$({
    body: Joi.object({
        enterprise_id: Joi.number().integer().min(1),
        
    })
})

export const createBatch$ = EffectFactory.matchPath('/batch')
    .matchType('POST')
    .use(req$ =>
        req$.pipe(
            use(validator$),
            mergeMap(req =>
                of(req.body).pipe(
                    mergeMap(batch =>
                        from(
                            getRepository(BatchModel).save({
                                ...batch,
                                gen_code_count:
                                    batch.code_count *
                                    (1 + batch.loss_rate / 10000),
                                batch_status: 0,
                                download_status: 0,
                                download_times: 0
                            })
                        )
                    ),
                    mergeMap(neverNullable),
                    map(batch => ({
                        body: {
                            code: 10000,
                            data: {
                                batch: batch
                            }
                        }
                    })),
                    catchError(error =>
                        throwError(
                            new HttpError(
                                `Consumer create fail: ${error}`,
                                HttpStatus.INTERNAL_SERVER_ERROR
                            )
                        )
                    )
                )
            )
        )
    )
