<script>
import { h } from 'vue'
import { useView } from '@/helpers/view'

const view = useView()

export default {
    props: ['schema', 'attribute', 'value'],
    setup(props) {
        return () => view.format(props.schema, props.attribute, props.value)
    }
}
</script>
