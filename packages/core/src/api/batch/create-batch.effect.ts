import { HttpError, HttpStatus, EffectFactory, use } from '@marblejs/core'
import { throwError, of, from } from 'rxjs'
import { mergeMap, map, catchError } from 'rxjs/operators'
import { getRepository } from 'typeorm'
import { neverNullable } from '@mazongguan-common/filter'
import { BatchModel } from '../../model'
import { validator$, Joi } from '@yeongjet/middleware-joi'

const validator = validator$({
    body: Joi.object({
        enterprise_id: Joi.number().integer().min(1).required(),
        batch_name: Joi.string().min(1).max(64).required(),
        code_count: Joi.number().integer().min(10000).max(200000000).required(),
        loss_rate: Joi.number().integer().min(0).max(10000).required(),
        label_type: Joi.number().integer().min(1).required(),
        code_type: Joi.number().integer().min(1).required(),
        product_id: Joi.number().integer().min(1).required(),
        export_column: Joi.object().keys({
            inside_code: Joi.object().keys({
                code_type: Joi.number().integer().min(1).required()
            }).required()
        }).required()
    })
})

export const createBatch$ = EffectFactory.matchPath('/batch')
    .matchType('POST')
    .use(req$ =>
        req$.pipe(
            use(validator),
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
