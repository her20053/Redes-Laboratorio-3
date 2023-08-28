import json
import graphviz

# Función para cargar el JSON del archivo
def load_graph_from_file(filename):
    with open(filename, 'r') as file:
        return json.load(file)

def visualize_pretty_graph(graph_data):
    dot = graphviz.Graph(format='png', engine='neato')
    
    # Añadir nodos al grafo con un color de fondo azul claro
    for node in graph_data['nodes']:
        dot.node(node, node, style='filled', fillcolor='lightblue', shape='ellipse', fontsize='12')
        
    # Añadir aristas al grafo con un color de línea azul oscuro
    for edge in graph_data['edges']:
        dot.edge(edge['from'], edge['to'], label=str(edge['weight']), color='darkblue', fontsize='10')
    
    # Añadiendo algunos atributos generales para hacer el grafo más estético
    dot.attr(overlap='false', splines='true')
    
    # Mostrar el grafo
    return dot

# Cargar el grafo desde el archivo JSON
graph_data = load_graph_from_file("modules/graph.json")

# Visualizar el grafo con estilo mejorado
pretty_graph = visualize_pretty_graph(graph_data)
pretty_graph.view()
