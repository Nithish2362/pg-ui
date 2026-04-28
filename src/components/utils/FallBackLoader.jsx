import { LoadingOverlay } from '@mantine/core';
import { useLoader } from '../../../common/LoaderContext';

const FallBackLoader = () => {

    const { isLoading } = useLoader();

    return (
        <>
            {/* <Box pos="fixed" top={65} left={0} w="100vw" h="100vh" style={{ zIndex: 10 }}> */}
            <LoadingOverlay
                pos="fixed"
                top={65}
                left={0}
                w="100vw"
                h="100vh"
                visible={isLoading}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'pink', type: 'bars' }}
            />
            {/* </Box> */}
        </>
    );
}

export default FallBackLoader;