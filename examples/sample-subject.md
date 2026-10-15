# Designing Modern Distributed Systems
Architectural breakdown covering replication, consensus, partitioning, and observability for resilient cloud backends.

## Consistency & Consensus Protocols
- Raft leader election and log replication dynamics
- Paxos quorum mechanics and multi-paxos optimizations
- Eventual consistency and conflict-free replicated data types (CRDTs)
- Vector clocks vs Hybrid Logical Clocks (HLC)

## Partitioning & Data Sharding
- Consistent hashing with virtual nodes
- Range-based partitioning vs hash-based partitioning
- Hot spot detection and automated rebalancing
- Cross-shard distributed transactions (Two-Phase Commit vs Sagas)

## Resilience & Fault Tolerance
- Circuit breaker and rate limiting implementations
- Bulkhead isolation patterns
- Exponential backoff with jitter algorithms
- Chaos engineering experiment automation

## Observability & Telemetry
- OpenTelemetry distributed trace context propagation
- High-cardinality metrics storage and downsampling
- Structured audit logging and compliance masking
- Anomaly detection on service level objectives (SLOs)
