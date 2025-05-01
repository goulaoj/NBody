#include "NBody.h"

void NBodySim::initialize(int numBodies, double g) {

    M.resize(numBodies);
    X.resize(numBodies * 2); 
    V.resize(numBodies * 2);
    G = g;
    t = 0;
    e = 1e-10;

}

void NBodySim::setBody(int index, double mass, double x, double y, double vx, double vy){

    X[2*index  ] = x;
    X[2*index+1] = y;
    V[2*index  ] = vx;
    V[2*index+1] = vy;
    M[index] = mass;

}

void NBodySim::setG(double newG){
    G = newG;
}

void NBodySim::setSoftening(double newe){
    e = newe;
}

void NBodySim::step(double dt){


    ODEsolver solver(GetFunctions());

    ODEpoint i(GetODEpoint());

    solver.RK4(i, dt);

    Update(i);

}

double NBodySim::getKineticEnergy(){

    double T = 0;

    for (int i = 0; i < M.size(); i++){

        double v2 = V[2*i]*V[2*i] + V[2*i+1]*V[2*i+1];
        T += 0.5*M[i]*v2;

    }

    return T;

}

double NBodySim::getPotencialEnergy(){

    double P = 0;

    for (int i = 0; i < M.size(); i++){

        double xi = X[2*i];
        double yi = X[2*i+1];

        for (int j = i+1; j < M.size(); j++){

            if (i==j) continue;

            double dx = xi - X[2*j];
            double dy = yi - X[2*j+1];
            double r = std::sqrt(dx*dx + dy*dy);

            P += -(G*M[i]*M[j])/r;

        }

    }

    return P;

}

double NBodySim::getTotalEnergy(){

    double E = getKineticEnergy() + getPotencialEnergy();

    return E;

}

double NBodySim::getAngularMomentum(){

    double L = 0;
    for (int i = 0; i < M.size(); i++) {
        L += M[i] * (X[2*i]*V[2*i+1] - X[2*i+1]*V[2*i]);
    }
    return L;

}

emscripten::val NBodySim::getPositions() const {
    return emscripten::val(emscripten::typed_memory_view(X.size(), X.data()));
}

emscripten::val NBodySim::getVelocities() const {
    return emscripten::val(emscripten::typed_memory_view(V.size(), V.data()));
}

emscripten::val NBodySim::getMasses() const {
    return emscripten::val(emscripten::typed_memory_view(M.size(), M.data()));
}

const std::vector<std::function<double(ODEpoint)>> NBodySim::GetFunctions(){


    int N = M.size();
    const auto masses = M;
    const double Gc  = G;
    const double eps = e;

    std::vector<std::function<double(ODEpoint)>> funcs;
    funcs.reserve(N * 4);

    for (int b = 0; b < N; ++b) {
        int idx = 4 * b; // offset into [ x, y, vx, vy, ... ]

        // dx/dt = vx
        funcs.push_back([idx](const ODEpoint& p) {
            return p.X()[idx + 2];
        });
        // dy/dt = vy
        funcs.push_back([idx](const ODEpoint& p) {
            return p.X()[idx + 3];
        });

        // dvx/dt = Σ G·m_j·(x_j - x_i) / (r²+ε)^(3/2)
        funcs.push_back([idx, N, masses, Gc, eps](const ODEpoint& p) {
            double ax = 0.0;
            double xi = p.X()[idx], yi = p.X()[idx + 1];
            for (int j = 0; j < N; ++j) {
                if (j == idx/4) continue;
                int jj = 4*j;
                double dx = p.X()[jj]     - xi;
                double dy = p.X()[jj + 1] - yi;
                double r3 = std::pow(dx*dx + dy*dy + eps, 1.5);
                ax += Gc * masses[j] * dx / r3;    // ← dx here
            }
            return ax;
        });

        // dvy/dt = Σ G·m_j·(y_j - y_i) / (r²+ε)^(3/2)
        funcs.push_back([idx, N, masses, Gc, eps](const ODEpoint& p) {
            double ay = 0.0;
            double xi = p.X()[idx], yi = p.X()[idx + 1];
            for (int j = 0; j < N; ++j) {
                if (j == idx/4) continue;
                int jj = 4*j;
                double dx = p.X()[jj]     - xi;
                double dy = p.X()[jj + 1] - yi;
                double r3 = std::pow(dx*dx + dy*dy + eps, 1.5);
                ay += Gc * masses[j] * dy / r3;    // ← dy here
            }
            return ay;
        });
    }

    return funcs;

};

ODEpoint NBodySim::GetODEpoint(){


    std::vector<double> vec;
    for (int i = 0; i < X.size(); i = i+2){

        vec.push_back(X[i]);
        vec.push_back(X[i+1]);
        vec.push_back(V[i]);
        vec.push_back(V[i+1]); 
    }

    return ODEpoint(t, vec);

}

void NBodySim::Update(ODEpoint p){

    std::vector<double> x;
    std::vector<double> v;

    for (int i = 0; i < p.X().size(); i=i+4){

        x.push_back(p[i]);
        x.push_back(p[i+1]);
        v.push_back(p[i+2]);
        v.push_back(p[i+3]);

    }

    X = x;
    V = v;
    t = p.T();
}


EMSCRIPTEN_BINDINGS(NBody) {
    emscripten::class_<NBodySim>("NBodySimulator")
        .constructor<>()
        .function("initialize", &NBodySim::initialize)
        .function("setBody", &NBodySim::setBody)
        .function("setG", &NBodySim::setG)
        .function("setSoftening", &NBodySim::setSoftening)
        .function("step", &NBodySim::step)
        .function("getKineticEnergy", &NBodySim::getKineticEnergy)
        .function("getPotencialEnergy", &NBodySim::getPotencialEnergy)
        .function("getTotalEnergy", &NBodySim::getTotalEnergy)
        .function("getAngularMomentum", &NBodySim::getAngularMomentum)
        .function("getPositions", &NBodySim::getPositions)
        .function("getVelocities", &NBodySim::getVelocities)
        .function("getMasses", &NBodySim::getMasses);


}
