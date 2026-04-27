import { useContext, useState } from 'react';
import { Stepper, Button, Group } from '@mantine/core';
import { ProductContext } from '../components/product/product/CreateProduct';

const B2BStepper = ({ productType: ProductType, productImage: ProductImage, productCategory: ProductCategory, tax: Tax, productVariant: ProductVariant, variantImage: VariantImage }) => {
    const [active, setActive] = useState(0);
    const [highestStepVisited, setHighestStepVisited] = useState(active);

    const { product: product, addProduct: addProduct } = useContext(ProductContext)

    const handleStepChange = (nextStep) => {
        const isOutOfBounds = nextStep > 6 || nextStep < 0;

        if (isOutOfBounds) {
            return;
        }

        setActive(nextStep);
        setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
    };

    const shouldAllowSelectStep = (step) => highestStepVisited >= step && active !== step;

    return (
        <>
            <Stepper active={active} onStepClick={setActive}>
                <Stepper.Step
                    label="ProductType"
                    description="Create an Product"
                    allowStepSelect={shouldAllowSelectStep(1)}
                >
                    <ProductType />
                </Stepper.Step>
                <Stepper.Step
                    label="Image"
                    description="Overall Product Image"
                    allowStepSelect={shouldAllowSelectStep(2)}
                >
                    <ProductImage />
                </Stepper.Step>
                <Stepper.Step
                    label="Category"
                    description="Create a Category"
                    allowStepSelect={shouldAllowSelectStep(3)}
                >
                    <ProductCategory />
                </Stepper.Step>
                <Stepper.Step
                    label="Tax"
                    description="Tax Details"
                    allowStepSelect={shouldAllowSelectStep(4)}
                >
                    <Tax />
                </Stepper.Step>
                <Stepper.Step
                    label="Create Variant"
                    description="Create an account"
                    allowStepSelect={shouldAllowSelectStep(5)}
                >
                    <ProductVariant />
                </Stepper.Step>
                <Stepper.Step
                    label="Create Variant"
                    description="Create an account"
                    allowStepSelect={shouldAllowSelectStep(6)}
                >
                    <VariantImage />
                </Stepper.Step>

                <Stepper.Completed>
                    Completed, click back button to get to previous step
                </Stepper.Completed>
            </Stepper>

            <Group justify="center" mt="xl">
                <Button variant="default" onClick={() => handleStepChange(active - 1)}>
                    Back
                </Button>
                <Button onClick={() => { addProduct(product); handleStepChange(active + 1) }}>Next step</Button>
            </Group>
        </>
    );
}

export default B2BStepper