import { inject, injectable } from 'inversify'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { Document } from 'mongodb';
import { Request, Response } from 'express';

@injectable()
export class UseCaseProductionZonas {
    constructor(
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(req: Request, res: Response) {
        const { año, mes } = req.body

        const fechaInicio = new Date(año, mes - 1, 1, 0, 0, 0);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);
        const estados = ["Finalizada", "Cancelada", "Regestión", "Anulada"];

        const pipeline: Document[] = [
            {
                $match: {
                    estado: { $in: estados },
                    fecha_visita: { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $addFields: {
                    tipoFinalizada: {
                        $cond: [
                            { $eq: ["$estado", "Finalizada"] },
                            {
                                $cond: [
                                    {
                                        $regexMatch: {
                                            input: "$suscripción.campaña",
                                            regex: /^Aumento de velocidad/i
                                        }
                                    },
                                    "Finalizada",
                                    "Garantia"
                                ]
                            },
                            null
                        ]
                    }
                }
            },
            {
                $addFields: {
                    zonaClasificada: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $in: [
                                            "$direccion_cliente.region",
                                            ["REGION NORTE 2 LIMA", "REGION CENTRAL 1 LIMA"]
                                        ]
                                    },
                                    then: "NORTE"
                                },
                                {
                                    case: {
                                        $in: [
                                            "$direccion_cliente.region",
                                            [
                                                "REGION SUR 2 LIMA",
                                                "REGION SUR 5 LIMA",
                                                "REGION SUR 4 LIMA",
                                                "REGION SUR 3 LIMA"
                                            ]
                                        ]
                                    },
                                    then: "SUR"
                                },
                                {
                                    case: {
                                        $in: [
                                            "$direccion_cliente.region",
                                            [
                                                "REGION OESTE 2 LIMA",
                                                "REGION OESTE 1 LIMA",
                                                "REGION OESTE 3 LIMA"
                                            ]
                                        ]
                                    },
                                    then: "OESTE"
                                }
                            ],
                            default: "SIN CLASIFICAR"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        zonaCliente: "$direccion_cliente.zona",
                        zonaClasificada: "$zonaClasificada"
                    },
                    Finalizada: {
                        $sum: {
                            $cond: [{ $eq: ["$tipoFinalizada", "Finalizada"] }, 1, 0]
                        }
                    },
                    Garantia: {
                        $sum: {
                            $cond: [{ $eq: ["$tipoFinalizada", "Garantia"] }, 1, 0]
                        }
                    },
                    Cancelada: {
                        $sum: { $cond: [{ $eq: ["$estado", "Cancelada"] }, 1, 0] }
                    },
                    Regestion: {
                        $sum: { $cond: [{ $eq: ["$estado", "Regestión"] }, 1, 0] }
                    },
                    Anulada: {
                        $sum: { $cond: [{ $eq: ["$estado", "Anulada"] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    zonaCliente: "$_id.zonaCliente",
                    zonaClasificada: "$_id.zonaClasificada",
                    resumen: {
                        Finalizada: "$Finalizada",
                        Garantia: "$Garantia",
                        Cancelada: "$Cancelada",
                        Regestion: "$Regestion",
                        Anulada: "$Anulada",
                        totalFinalizadas: { $add: ["$Finalizada", "$Garantia"] }
                    }
                }
            },
            { $sort: { zonaClasificada: 1, zonaCliente: 1 } }
        ];

        return this.repository.find(pipeline, req, res)
    }
}
