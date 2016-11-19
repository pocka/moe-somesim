import { compose } from '../util/class'

export default ({ props, children }) => {
	return <div class={ compose('panel', props.class) }>{ children }</div>
}
