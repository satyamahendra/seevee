"use client"

import {useQueryParams} from "@/utils/hooks/useQueryParams"
import {GetProduct} from "../services/get-products"
import {PiCoins, PiCube, PiPackage, PiPencil} from "react-icons/pi"
import {Separator} from "@/components/ui/separator"
import {normalizeString} from "@/utils/helpers/normalize-string"
import {Button} from "@/components/ui/button"
import ListItem from "@/components/custom/item"

type ProductItemProps = {
    product: GetProduct
}

const ProductItem = ({product}: ProductItemProps) => {
    const {setParams} = useQueryParams()

    return (
        <ListItem
            title={product.name}
            description={
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-2 font-medium">Rp. {product.price_actual}</span>
                    <Separator orientation="vertical" />
                    <span className="flex items-center gap-1">
                        <PiCube className="text-sm" />
                        {normalizeString(product.type)}
                    </span>
                    <Separator orientation="vertical" />
                    <span className="flex items-center gap-1">
                        <PiCoins className="text-sm" />
                        {product.credit} credits
                    </span>
                    <Separator orientation="vertical" />
                    <span className="flex items-center gap-1">
                        <PiPackage className="text-sm" />
                        {product?.bundle_items?.length}
                    </span>
                </div>
            }
            actions={
                <Button className="rounded-lg" onClick={() => setParams({view: product.id})} size={"icon-sm"} variant="outline">
                    <PiPencil />
                </Button>
            }
        />
    )
}

export default ProductItem
