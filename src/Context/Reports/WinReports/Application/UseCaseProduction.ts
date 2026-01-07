import { inject, injectable } from 'inversify'
import { WIN_ORDER_TYPES } from '@Processes/WinOrder/Infrastructure/IoC/types'
import { IWINOrderMongoRepository } from '@Processes/WinOrder/Domain'
import { Document } from 'mongodb';
import { Request, Response } from 'express';

@injectable()
export class UseCaseProduction {
    constructor(
        @inject(WIN_ORDER_TYPES.RepositoryMongo) private readonly repository: IWINOrderMongoRepository,
    ) { }

    async exec(req: Request, res: Response) {
        const { año, mes } = req.body
        const fechaInicio = new Date(año, mes, 1)
        const fechaFin = new Date(año, mes + 1, 1)

        const estados = ["Finalizada", "Cancelada", "Regestión", "Anulada"]

        const pipeline: Document[] = [
            {
                $match: {
                    estado: { $in: estados },
                    fecha_visita: { $gte: fechaInicio, $lte: fechaFin }
                }
            },
            {
                $group: {
                    _id: {
                        tecnico: "$tecnico",
                        dia: { $dayOfMonth: "$fecha_visita" },
                        estado: "$estado",
                        campaña: "$suscripcion.campaña" // NUEVO
                    },
                    total: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.tecnico": 1,
                    "_id.dia": 1,
                    "_id.estado": 1
                }
            },
            {
                $group: {
                    _id: {
                        tecnico: "$_id.tecnico",
                        dia: "$_id.dia"
                    },
                    estados: {
                        $push: {
                            estado: "$_id.estado",
                            campaña: "$_id.campaña", // NUEVO
                            total: "$total"
                        }
                    }
                }
            },
            {
                $project: {
                    tecnico: "$_id.tecnico",
                    dia: "$_id.dia",
                    Finalizada: {
                        $sum: {
                            $map: {
                                input: "$estados",
                                as: "e",
                                in: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$$e.estado", "Finalizada"] },
                                                { $not: { $regexMatch: { input: "$$e.campaña", regex: /^Aumento de velocidad/i } } }
                                            ]
                                        },
                                        "$$e.total",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    Garantia: {
                        $sum: {
                            $map: {
                                input: "$estados",
                                as: "e",
                                in: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$$e.estado", "Finalizada"] },
                                                { $regexMatch: { input: "$$e.campaña", regex: /^Aumento de velocidad/i } }
                                            ]
                                        },
                                        "$$e.total",
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    Cancelada: {
                        $sum: {
                            $map: {
                                input: "$estados",
                                as: "e",
                                in: { $cond: [{ $eq: ["$$e.estado", "Cancelada"] }, "$$e.total", 0] }
                            }
                        }
                    },
                    Regestion: {
                        $sum: {
                            $map: {
                                input: "$estados",
                                as: "e",
                                in: { $cond: [{ $eq: ["$$e.estado", "Regestión"] }, "$$e.total", 0] }
                            }
                        }
                    },
                    Anulada: {
                        $sum: {
                            $map: {
                                input: "$estados",
                                as: "e",
                                in: { $cond: [{ $eq: ["$$e.estado", "Anulada"] }, "$$e.total", 0] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalDia: {
                        $add: ["$Finalizada", "$Garantia", "$Cancelada", "$Regestion", "$Anulada"]
                    }
                }
            },
            {
                $group: {
                    _id: "$tecnico",
                    produccion: {
                        $push: {
                            dia: "$dia",
                            Finalizada: "$Finalizada",
                            Garantia: "$Garantia",
                            Cancelada: "$Cancelada",
                            Regestion: "$Regestion",
                            Anulada: "$Anulada",
                            totalDia: "$totalDia"
                        }
                    },
                    totalFinalizada: { $sum: "$Finalizada" },
                    totalGarantia: { $sum: "$Garantia" },
                    totalCancelada: { $sum: "$Cancelada" },
                    totalRegestion: { $sum: "$Regestion" },
                    totalAnulada: { $sum: "$Anulada" }
                }
            },
            {
                $project: {
                    _id: 0,
                    tecnico: "$_id",
                    resumenEstado: {
                        Finalizada: "$totalFinalizada",
                        Garantia: "$totalGarantia",
                        Cancelada: "$totalCancelada",
                        Regestion: "$totalRegestion",
                        Anulada: "$totalAnulada"
                    },
                    produccion: 1
                }
            }
        ]
        return this.repository.find(pipeline, req, res)
    }
}
