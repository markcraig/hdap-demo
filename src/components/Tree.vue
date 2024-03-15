<template>
    <div id="container" class="d-flex flex-column justify-content-center align-items-center">
        <h4 v-if="loading">Loading</h4>
        <h4 v-if="error" class="text-danger">{{ error }}</h4>
        <div id="cy" class="cy"></div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store/app'
import cydagre from "cytoscape-dagre"
import cytoscape from "cytoscape"

let cy = undefined;
const store = useAppStore()
//const router = useRouter();
const loading = ref(false);
const error = ref(null);
const props = defineProps({
    data: {
        type: Object,
        required: false
    },
    searchFromChild: Function
});
const emit= defineEmits(["nodeSelected"]);

const extractUid = (entry) => {
    let subParts = entry.split('/')
    return decodeURIComponent(subParts[subParts.length - 1].split('=')[1])
}

const drawGraph = () => {

    const data = props.data;
    const debug = true;
    const nodes = [];
    const edges = [];
    
    if (debug) console.log('data=', JSON.stringify(data));

    //Parse results
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const entryId = entry._id;
        
        if (debug) console.log('entry=', JSON.stringify(entry));

        // Extract Parent _id
        let lastIndex = entryId.lastIndexOf('/');
        const parentOrg = entryId.substring(0, lastIndex);

        //Add node for Parent Org
        let parentNode = { data: { id: parentOrg, label: parentOrg } };
        if (debug) console.log("parentNode="+JSON.stringify(parentNode));
        nodes.push(parentNode);

        // Handle Group entry
        if (entry.uniqueMember){
            if (debug) console.log("uniqueMember="+JSON.stringify(entry.uniqueMember))

            //Add node for group
            let groupNode = { data: { id: entryId, label: extractUid(entryId) } };
            if (debug) console.log("parentNode="+JSON.stringify(groupNode));
            nodes.push(groupNode);

            //Add nodes and edges for members
            entry.uniqueMember.forEach(member => {

                const memberUid = extractUid(member);
                let memberNode = { data: { id: member, label: memberUid } };
                if (debug) console.log("memberNode="+JSON.stringify(memberNode));
                nodes.push(memberNode);

                let memberEdge = { data: { id: entryId+'-'+memberUid,  label: '', source: entryId, target: member } }
                if (debug) console.log("memberEdge="+JSON.stringify(memberEdge));
                edges.push(memberEdge);
            });

        // Handle entry with uid
        } else if(entry.uid) {
            const entryUid = entry.uid[0];
                                
            // Add nodes for user
            let entryNode = { data: { id: entryId, label: entryUid } };
            if (debug) console.log("entryNode="+JSON.stringify(entryNode));
            nodes.push(entryNode);

            let entryEdge = { data: { id: parentOrg+'-'+entryId,  label:'', source: parentOrg, target: entryId } }
            if (debug) console.log("entryEdge="+JSON.stringify(entryEdge));
            edges.push(entryEdge);

            //Add node and edges to manager
            if (entry.manager) {
                if (debug) console.log("manager="+JSON.stringify(entry.manager));

                const managerId = entry.manager[0];
                const managerUid = extractUid(managerId);
                
                let managerNode = { data: { id: managerId, label: managerUid } };
                if (debug) console.log("managerNode="+JSON.stringify(managerNode));
                nodes.push(managerNode);

                let managerEdge = { data: { id: entryUid+'-'+managerUid, label: 'manager', source: entryId, target: managerId } }
                if (debug) console.log("managerEdge="+JSON.stringify(managerEdge));
                edges.push(managerEdge);
            }
        }
    };

    //Initialize Layout
    cydagre(cytoscape);
    const layoutOptions = { 
            name: 'dagre',
            columns: 5,
            avoidOverlap: true,
            padding: 10,
            spacingFactor: 1,
            rankDir: 'TB',
            animate: true,
            fit:true,
            //nodeSep: 50,
            //rankSep: 100,
            nodeDimensionsIncludeLabels: true,
    }

    //Initialize Graph
    cy = cytoscape({
        container: document.getElementById("cy"),
        elements: {
            nodes: nodes,
            edges: edges
        },
        layout: layoutOptions,
        minZoom: 0.1,
        maxZoom: 2.0,
        boxSelectionEnabled: true,
        style: [
            {
                selector: 'node',
                style: {
                    "content": "data(label)",
                    'width': (node) => { 
                        return (node.data('label'))? node.data('label').length * 10 : '10'
                    },
                    'text-max-width': '100px',
                    'padding': '5px',
                    "shape": "roundrectangle",
                    'background-color': 'aliceblue',
                    "border-width": "1",
                    "text-wrap": "wrap",
                    "text-valign": "center",
                    "text-halign": "center",
                    'opacity': 0.8
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-color': 'blue',
                    'color': 'blue',
                    "border-width": "2",
                    'opacity': 1
                }
            },
            {
                selector: ':parent',
                style: {
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'text-margin-y': '-2px',
                    'font-size': '24px',
                    'border-style': 'solid',
                    'background-color': 'LightGrey',
                    'opacity': 0.5
                }
            },
            {
                selector: 'edge',
                style: {
                    "content": "data(label)",
                    'width': '1px',
                    'font-size': '8px',    
                    'color': 'Grey',
                    'line-color': 'LightGrey',
                    'line-style': 'dashed', // solid, dashed, dotted
                    'line-cap': 'butt', // round, square
                    'target-arrow-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-fill': 'filled',
                    'curve-style': 'haystack',
                    'opacity': 0.7
                }
            }
        ]
    });

    cy.on('click', 'node', function(evt){
        
        let selectedNode = evt.target;
        console.log("Selected: " + selectedNode.id());
        console.log("Selected data: " + JSON.stringify(selectedNode.data()));

        //Emit event to parent
        emit('nodeSelected', selectedNode.data().label);
    });
}

onMounted(() => { drawGraph(); })
onUnmounted(() => { cy.destroy(); })
watch(() => props.data, () => { drawGraph(); })

</script>

<style lang="scss">
#cy {
  width: 900px; 
  height: 600px;
}
</style>